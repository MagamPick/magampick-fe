import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { nullish, nullableString, nullableNumber } from '@/shared/lib/zodNullable'
import { orderStatusSchema } from '../types'
import type { Order, RefundStatus } from '../types'
import type { CartItem, CartItemKind, Pickup } from '@/features/cart/types'

// ─── BE OrderResponse Zod 스키마 (공용 — confirm/listOrders/getOrder/cancelOrder 공유) ─────

const orderItemFromResponseSchema = z.object({
  id: nullableNumber(),
  kind: nullableString(),
  name: nullableString(),
  imageUrl: z.string().nullable().optional(),
  originalPrice: nullableNumber(),
  salePrice: nullableNumber(),
  qty: nullableNumber(),
})

const refundInfoResponseSchema = z.object({
  status: nullableString(),
  reason: nullableString(),
  requestedAt: nullableString(),
  rejectReason: nullableString(),
  resolvedAt: nullableString(),
})

/**
 * BE OrderResponse 단건 Zod 스키마.
 * status 는 도메인 7-enum 으로 엄격 검증 — BE 가 AWAITING_PAYMENT 등 외부 값을 보내면 파스에서 throw.
 * (런타임 미검증 리스크: listOrders 에 AWAITING_PAYMENT 주문이 포함될 수 있으나 실 데이터 확인 불가 — 리포트 명시)
 */
export const orderResponseSchema = z.object({
  id: nullableNumber(),
  orderNo: nullableString(),
  storeId: nullableNumber(),
  storeName: nullableString(),
  storePhone: nullableString(),
  items: nullish(z.array(orderItemFromResponseSchema)),
  pickup: nullish(
    z.object({
      type: nullableString(),
      time: nullableString(),
    }),
  ),
  memo: nullableString(),
  amounts: nullish(
    z.object({
      normalTotal: nullableNumber(),
      discountTotal: nullableNumber(),
      payTotal: nullableNumber(),
      /** 쿠폰 할인액 (X1-BE) */
      couponDiscount: nullableNumber(),
      /** 포인트 사용액 (X1-BE) */
      pointUsed: nullableNumber(),
      /** 실결제액 = 최종 토스 청구액 (X1-BE) — payTotal − couponDiscount − pointUsed */
      finalAmount: nullableNumber(),
    }),
  ),
  pickupCode: nullableString(),
  /** 도메인 7-enum 엄격 검증 (PENDING·PREPARING·READY·COMPLETED·NO_SHOW·REJECTED·CANCELLED) */
  status: nullish(orderStatusSchema),
  paymentMethod: nullableString(),
  createdAt: nullableString(),
  /** 수령완료 시각 (COMPLETED) */
  completedAt: nullableString(),
  /** 취소 시각 (CANCELLED) — 도메인에선 completedAt 으로 흡수 */
  cancelledAt: nullableString(),
  /** 환불 정보 (미요청 시 absent) */
  refund: nullish(refundInfoResponseSchema),
})

export type TossConfirmResponse = z.infer<typeof orderResponseSchema>

export interface TossConfirmInput {
  /** 토스 발급 결제 키 */
  paymentKey: string
  /** 주문 DB ID (PrepareOrderResponse.orderId) — 숫자 */
  orderId: number
  /** 결제 금액 (PrepareOrderResponse.amount 와 일치) */
  amount: number
}

export const paymentApi = {
  /**
   * 토스 결제 confirm — 실 BE POST /api/v1/payments/toss/confirm.
   * paymentKey·orderId(숫자 DB id)·amount 를 서버로 전달해 최종 승인. 주문 PENDING 활성화.
   */
  async confirm(input: TossConfirmInput): Promise<TossConfirmResponse> {
    const { data } = await apiClient.post('/payments/toss/confirm', input)
    return orderResponseSchema.parse(data)
  },
}

// ─── BE OrderResponse → 클라이언트 Order 변환 ─────────────────────────────────

/**
 * BE OrderResponse → 클라이언트 Order 변환 (공용 — confirm/listOrders/getOrder/cancelOrder 공유).
 * - storeId·items[].id: number → string
 * - kind: 'DEAL'/'MENU' → 'deal'/'menu'
 * - pickup type: 'ASAP'/'SLOT' → 'asap'/'slot'
 * - completedAt: completedAt ?? cancelledAt (DONE_STATUSES 카드 날짜용 흡수)
 * - refund: RefundInfoResponse → 도메인 Refund (status 자유 string → RefundStatus 캐스트)
 */
export function mapToClientOrder(res: TossConfirmResponse): Order {
  const items: CartItem[] = (res.items ?? []).map((item) => ({
    id: String(item.id ?? 0),
    kind: (item.kind?.toLowerCase() === 'deal' ? 'deal' : 'menu') as CartItemKind,
    name: item.name ?? '',
    imageUrl: item.imageUrl ?? null,
    originalPrice: item.originalPrice ?? 0,
    salePrice: item.salePrice ?? 0,
    qty: Math.min(Math.max(item.qty ?? 1, 1), 10),
  }))

  const pickup: Pickup =
    res.pickup?.type?.toUpperCase() === 'SLOT' && res.pickup.time
      ? { type: 'slot', time: res.pickup.time }
      : { type: 'asap' }

  const refund =
    res.refund?.requestedAt
      ? {
          status: (res.refund.status ?? 'REQUESTED') as RefundStatus,
          reason: res.refund.reason ?? '',
          requestedAt: res.refund.requestedAt,
          ...(res.refund.rejectReason !== undefined
            ? { rejectReason: res.refund.rejectReason }
            : {}),
          ...(res.refund.resolvedAt !== undefined ? { resolvedAt: res.refund.resolvedAt } : {}),
        }
      : undefined

  return {
    id: String(res.id ?? 0),
    orderNo: res.orderNo ?? '',
    storeId: String(res.storeId ?? 0),
    storeName: res.storeName ?? '',
    storePhone: res.storePhone,
    items,
    pickup,
    memo: res.memo ?? '',
    amounts: {
      normalTotal: res.amounts?.normalTotal ?? 0,
      discountTotal: res.amounts?.discountTotal ?? 0,
      payTotal: res.amounts?.payTotal ?? 0,
      ...(res.amounts?.couponDiscount !== undefined
        ? { couponDiscount: res.amounts.couponDiscount }
        : {}),
      ...(res.amounts?.pointUsed !== undefined ? { pointUsed: res.amounts.pointUsed } : {}),
      ...(res.amounts?.finalAmount !== undefined ? { finalAmount: res.amounts.finalAmount } : {}),
    },
    pickupCode: res.pickupCode ?? '0000',
    status: res.status ?? 'PENDING',
    paymentMethod: 'toss',
    createdAt: res.createdAt ?? new Date().toISOString(),
    /** cancelledAt → completedAt 흡수: DONE_STATUSES 카드 날짜 표시에 단일 필드 사용 */
    completedAt: res.completedAt ?? res.cancelledAt,
    ...(refund ? { refund } : {}),
  }
}
