import { request } from '@playwright/test'
import { API_V1 } from './env'

/**
 * dev 전용 주문 시드 — POST /dev/test/orders (local/dev 전용, 인증 불필요).
 * dev 는 토스 confirm 에 실 paymentKey 가 필요해 결제주문을 일반 API 로 못 만든다 → 이 엔드포인트로
 * 목표 상태의 결제주문을 즉석 생성한다. **fresh ID 명시 전달**(createCustomer + seedClearance) — auto-select
 * 의존 금지(병렬 contention).
 *
 * 응답: { orderId, orderNo, pickupCode, status, customerId, storeId, finalAmount }
 */
export type OrderState = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'NO_SHOW'

export type SeededOrder = {
  orderId: number
  orderNo: string
  pickupCode: string
  status: string
  customerId: number
  storeId: number
  finalAmount: number
}

export async function seedOrder(input: {
  targetState: OrderState
  customerId: number
  storeId: number
  clearanceItemId: number
}): Promise<SeededOrder> {
  const req = await request.newContext()
  try {
    const res = await req.post(`${API_V1}/dev/test/orders`, { data: input })
    if (!res.ok()) throw new Error(`[seed] order 실패 ${res.status()}: ${await res.text()}`)
    const body = (await res.json()) as { data?: SeededOrder }
    return (body.data ?? body) as SeededOrder
  } finally {
    await req.dispose()
  }
}
