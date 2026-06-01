import { orderSchema, type Order } from '../types'
import type { CartAmounts, CartItem, CartStoreInfo, Pickup } from '@/features/cart/types'

/**
 * ⚠️ Mock 스텁 — 주문 BE(order 도메인 미구현)가 아직이라 클라이언트에서 가짜 생성.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 확정 시점 검증(재고·영업)은 서버 책임 — mock 은 stub success(항상 생성)로 둔다(노션 "stub 우선").
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export interface CreateOrderInput {
  store: Pick<CartStoreInfo, 'id' | 'name'>
  items: CartItem[]
  pickup: Pickup
  memo: string
  amounts: CartAmounts
  paymentKey: string
}

/** 픽업 인증 코드 — 1000~9999 4자리 */
function generatePickupCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export const orderApi = {
  async create(input: CreateOrderInput): Promise<Order> {
    await delay(400)
    const order: Order = {
      id: `ord_${Date.now()}`,
      storeId: input.store.id,
      storeName: input.store.name,
      items: input.items,
      pickup: input.pickup,
      memo: input.memo,
      amounts: input.amounts,
      pickupCode: generatePickupCode(),
      status: 'PENDING',
      paymentMethod: 'toss',
      createdAt: new Date().toISOString(),
    }
    return orderSchema.parse(order)
  },
}
