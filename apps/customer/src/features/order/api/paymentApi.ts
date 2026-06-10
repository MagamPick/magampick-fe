import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import type { Order, OrderStatus } from '../types'
import type { CartItem, CartItemKind, Pickup } from '@/features/cart/types'

// ─── confirm 응답 스키마 (OrderResponse 대응) ────────────────────────────────

const orderItemFromResponseSchema = z.object({
  id: z.number().optional(),
  kind: z.string().optional(),
  name: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  originalPrice: z.number().optional(),
  salePrice: z.number().optional(),
  qty: z.number().optional(),
})

const confirmResponseSchema = z.object({
  id: z.number().optional(),
  orderNo: z.string().optional(),
  storeId: z.number().optional(),
  storeName: z.string().optional(),
  storePhone: z.string().optional(),
  items: z.array(orderItemFromResponseSchema).optional(),
  pickup: z
    .object({
      type: z.string().optional(),
      time: z.string().optional(),
    })
    .optional(),
  memo: z.string().optional(),
  amounts: z
    .object({
      normalTotal: z.number().optional(),
      discountTotal: z.number().optional(),
      payTotal: z.number().optional(),
    })
    .optional(),
  pickupCode: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().optional(),
})

export type TossConfirmResponse = z.infer<typeof confirmResponseSchema>

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
    return confirmResponseSchema.parse(data)
  },
}

// ─── BE OrderResponse → 클라이언트 Order 변환 ─────────────────────────────────

/**
 * confirm 응답(BE OrderResponse)을 클라이언트 Order 타입으로 변환.
 * storeId·items[].id 는 string 으로, kind 는 소문자로 변환. pickupCode 기본값 '0000'.
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
    },
    pickupCode: res.pickupCode ?? '0000',
    status: (res.status ?? 'PENDING') as OrderStatus,
    paymentMethod: 'toss',
    createdAt: res.createdAt ?? new Date().toISOString(),
    completedAt: res.completedAt,
  }
}
