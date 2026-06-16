import { z } from 'zod'
import type { Order, OrderAmounts } from '../types'
import type { CartItem, CartStoreInfo, Pickup } from '@/features/cart/types'
import { apiClient } from '@/shared/lib/axios'
import { orderResponseSchema, mapToClientOrder } from './paymentApi'

// ─── 실 BE 주문 준비 (prepare) ────────────────────────────────────────────

/** POST /api/v1/orders 응답 스키마 (PrepareOrderResponse) */
const prepareOrderResponseSchema = z.object({
  orderId: z.number(),
  tossOrderId: z.string(),
  amount: z.number(),
  orderName: z.string(),
})
export type PrepareResponse = z.infer<typeof prepareOrderResponseSchema>

/** prepare() 입력 — 카트 + 혜택 정보 */
export interface PrepareInput {
  store: Pick<CartStoreInfo, 'id' | 'name'>
  items: CartItem[]
  pickup: Pickup
  memo: string
  /** 결제 금액 (calcCheckoutAmounts 결과 — 쿠폰·포인트·적립 포함) */
  amounts: OrderAmounts
  /** 사용 쿠폰 UserCoupon number ID (선택) */
  couponId?: number | null
  /** 사용 포인트 (선택, 0 이상) */
  pointUsed?: number
}

interface CreateOrderBody {
  storeId: number
  items: Array<{ kind: 'DEAL' | 'MENU'; refId: number; quantity: number }>
  pickup: { type: 'ASAP' | 'SLOT'; time?: string }
  memo?: string
  paymentMethod: string
  paymentAgreed: boolean
  amounts: {
    normalTotal: number
    discountTotal: number
    payTotal: number
    couponDiscount?: number
    pointUsed?: number
    earnedPoints?: number
    finalAmount?: number
  }
  userCouponId?: number
  pointToUse?: number
}

/**
 * 카트 → CreateOrderRequest 변환 (BE 전달용 body 빌더).
 *
 * 상품/매장 실연동 완료 — cart 에 실 PK(String 변환)가 담겨 Number() 정상.
 * refId = DEAL:clearanceItemId / MENU:productId.
 */
export function buildCreateOrderRequest(input: PrepareInput): CreateOrderBody {
  return {
    storeId: Number(input.store.id),
    items: input.items.map((item) => ({
      kind: item.kind.toUpperCase() as 'DEAL' | 'MENU',
      refId: Number(item.id),
      quantity: item.qty,
    })),
    pickup:
      input.pickup.type === 'slot'
        ? { type: 'SLOT', time: input.pickup.time }
        : { type: 'ASAP' },
    ...(input.memo ? { memo: input.memo } : {}),
    paymentMethod: 'toss',
    paymentAgreed: true,
    amounts: {
      normalTotal: input.amounts.normalTotal,
      discountTotal: input.amounts.discountTotal,
      payTotal: input.amounts.payTotal,
      ...(input.amounts.couponDiscount !== undefined
        ? { couponDiscount: input.amounts.couponDiscount }
        : {}),
      ...(input.amounts.pointUsed !== undefined ? { pointUsed: input.amounts.pointUsed } : {}),
      ...(input.amounts.earnedPoints !== undefined
        ? { earnedPoints: input.amounts.earnedPoints }
        : {}),
      ...(input.amounts.finalAmount !== undefined
        ? { finalAmount: input.amounts.finalAmount }
        : {}),
    },
    ...(input.couponId ? { userCouponId: input.couponId } : {}),
    ...(input.pointUsed && input.pointUsed > 0 ? { pointToUse: input.pointUsed } : {}),
  }
}

export const orderApi = {
  /**
   * 주문 준비 — 실 BE POST /api/v1/orders.
   * AWAITING_PAYMENT 상태로 주문을 임시 생성하고 tossOrderId·amount·orderName 을 반환.
   * 반환값을 토스 SDK requestPayment 에 전달한 후 confirm 으로 최종 승인.
   */
  async prepare(input: PrepareInput): Promise<PrepareResponse> {
    const body = buildCreateOrderRequest(input)
    const { data } = await apiClient.post('/orders', body)
    return prepareOrderResponseSchema.parse(data)
  },

  /**
   * 내 주문 목록 — 실 BE GET /api/v1/orders.
   * OrderResponse[] Zod 검증 → mapToClientOrder → 최신순 정렬.
   */
  async listOrders(): Promise<Order[]> {
    const { data } = await apiClient.get('/orders')
    const list = z.array(orderResponseSchema).parse(data)
    const mapped = list.map(mapToClientOrder)
    return mapped.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  /**
   * 주문 상세 단건 — 실 BE GET /api/v1/orders/{id}.
   * 404 등 에러는 apiClient interceptor 가 ApiError 로 정규화 후 throw.
   */
  async getOrder(id: string): Promise<Order> {
    const { data } = await apiClient.get(`/orders/${id}`)
    return mapToClientOrder(orderResponseSchema.parse(data))
  },

  /**
   * 주문 취소 — 실 BE POST /api/v1/orders/{id}/cancel.
   * PENDING 상태 검증은 BE 담당 — 실패 시 ApiError throw (interceptor 정규화).
   */
  async cancelOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/orders/${id}/cancel`)
    return mapToClientOrder(orderResponseSchema.parse(data))
  },

  /**
   * 환불 요청 — 실 BE POST /api/v1/orders/{id}/refund (노션 「환불 요청」).
   * COMPLETED·미요청·픽업 후 3일 이내·사유 필수 검증은 BE 담당.
   * FE UI 게이팅(버튼 노출 조건)은 order/lib/refundPolicy.canRequestRefund 가 담당.
   */
  async requestRefund(id: string, reason: string): Promise<Order> {
    const { data } = await apiClient.post(`/orders/${id}/refund`, { reason })
    return mapToClientOrder(orderResponseSchema.parse(data))
  },
}
