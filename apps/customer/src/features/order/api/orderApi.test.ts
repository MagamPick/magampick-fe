import { describe, it, expect, vi, beforeEach } from 'vitest'
import { orderApi, buildCreateOrderRequest } from './orderApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}))
const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)

// ─── orderApi.requestRefund (실 BE) ──────────────────────────────────────────

describe('orderApi.requestRefund (실 BE)', () => {
  it('POST /orders/:id/refund 를 호출하고 환불 요청된 Order 를 반환한다', async () => {
    const refundResponse = {
      ...mockOrderResponse,
      id: 42,
      status: 'COMPLETED',
      completedAt: '2026-06-08T10:00:00.000Z',
      refund: { status: 'REQUESTED', reason: '상품 상태가 안 좋아요', requestedAt: '2026-06-10T10:00:00.000Z' },
    }
    mockedPost.mockResolvedValueOnce({ data: refundResponse })
    const result = await orderApi.requestRefund('42', '상품 상태가 안 좋아요')
    expect(mockedPost).toHaveBeenCalledWith('/orders/42/refund', { reason: '상품 상태가 안 좋아요' })
    expect(result.id).toBe('42')
    expect(result.refund?.status).toBe('REQUESTED')
    expect(result.refund?.reason).toBe('상품 상태가 안 좋아요')
    expect(result.refund?.requestedAt).toBe('2026-06-10T10:00:00.000Z')
  })

  it('응답이 OrderResponse 스키마에 맞지 않으면 Zod 에러', async () => {
    mockedPost.mockResolvedValueOnce({ data: { status: 9999 } })
    await expect(orderApi.requestRefund('42', '사유')).rejects.toThrow()
  })
})

// ─── orderApi.prepare (실 BE) ─────────────────────────────────────────────────

const mockPrepareResponse = {
  orderId: 42,
  tossOrderId: 'order-42',
  amount: 6000,
  orderName: '크루아상 세트',
}

const prepareInput = {
  store: { id: 'st-1', name: '브레드샵' },
  items: [
    { id: '10', kind: 'deal' as const, name: '크루아상 세트', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 1 },
  ],
  pickup: { type: 'asap' as const },
  memo: '',
  amounts: { normalTotal: 10000, discountTotal: 4000, payTotal: 6000 },
}

describe('orderApi.prepare', () => {
  it('POST /orders 로 body 를 전달하고 PrepareOrderResponse 를 반환', async () => {
    mockedPost.mockResolvedValueOnce({ data: mockPrepareResponse })
    const result = await orderApi.prepare(prepareInput)
    expect(mockedPost).toHaveBeenCalledWith('/orders', expect.any(Object))
    expect(result.orderId).toBe(42)
    expect(result.tossOrderId).toBe('order-42')
    expect(result.amount).toBe(6000)
  })

  it('응답이 PrepareOrderResponse 스키마에 맞지 않으면 Zod 에러', async () => {
    mockedPost.mockResolvedValueOnce({ data: { orderId: '문자열임' } }) // 타입 불일치
    await expect(orderApi.prepare(prepareInput)).rejects.toThrow()
  })
})

// ─── buildCreateOrderRequest ─────────────────────────────────────────────────

// ─── 실 BE 응답 픽스처 (OrderResponse) ───────────────────────────────────────

const mockOrderResponse = {
  id: 42,
  orderNo: '0042',
  storeId: 1,
  storeName: '브레드샵',
  storePhone: '02-1234-5678',
  items: [
    {
      id: 10,
      kind: 'DEAL',
      name: '크루아상 세트',
      imageUrl: null,
      originalPrice: 10000,
      salePrice: 6000,
      qty: 1,
    },
  ],
  pickup: { type: 'SLOT', time: '18:30' },
  memo: '포장 부탁드려요',
  amounts: { normalTotal: 10000, discountTotal: 4000, payTotal: 6000 },
  pickupCode: '1234',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: '2026-06-10T10:00:00.000Z',
}

// ─── orderApi.listOrders (실 BE) ──────────────────────────────────────────────

describe('orderApi.listOrders (실 BE)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /orders 를 호출하고 Order[] 를 반환한다', async () => {
    mockedGet.mockResolvedValueOnce({ data: [mockOrderResponse] })
    const result = await orderApi.listOrders()
    expect(mockedGet).toHaveBeenCalledWith('/orders')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('42')
    expect(result[0].storeName).toBe('브레드샵')
  })

  it('최신순 정렬 — BE 순서와 무관하게 createdAt 내림차순', async () => {
    const older = { ...mockOrderResponse, id: 1, createdAt: '2026-06-09T10:00:00.000Z' }
    const newer = { ...mockOrderResponse, id: 2, createdAt: '2026-06-10T10:00:00.000Z' }
    mockedGet.mockResolvedValueOnce({ data: [older, newer] })
    const result = await orderApi.listOrders()
    expect(result[0].id).toBe('2') // newer first
    expect(result[1].id).toBe('1')
  })

  it('응답이 OrderResponse 스키마에 맞지 않으면 Zod 에러', async () => {
    mockedGet.mockResolvedValueOnce({ data: [{ id: '문자열임' }] })
    await expect(orderApi.listOrders()).rejects.toThrow()
  })
})

// ─── orderApi.getOrder (실 BE) ────────────────────────────────────────────────

describe('orderApi.getOrder (실 BE)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /orders/:id 를 호출하고 Order 를 반환한다', async () => {
    mockedGet.mockResolvedValueOnce({ data: mockOrderResponse })
    const result = await orderApi.getOrder('42')
    expect(mockedGet).toHaveBeenCalledWith('/orders/42')
    expect(result.id).toBe('42')
    expect(result.storeName).toBe('브레드샵')
    expect(result.pickupCode).toBe('1234')
  })

  it('응답이 OrderResponse 스키마에 맞지 않으면 Zod 에러', async () => {
    mockedGet.mockResolvedValueOnce({ data: { status: 'UNKNOWN_STATUS' } })
    await expect(orderApi.getOrder('42')).rejects.toThrow()
  })
})

// ─── orderApi.cancelOrder (실 BE) ─────────────────────────────────────────────

describe('orderApi.cancelOrder (실 BE)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('POST /orders/:id/cancel 을 호출하고 CANCELLED Order 를 반환한다', async () => {
    const cancelled = { ...mockOrderResponse, status: 'CANCELLED', cancelledAt: '2026-06-10T11:00:00.000Z' }
    mockedPost.mockResolvedValueOnce({ data: cancelled })
    const result = await orderApi.cancelOrder('42')
    expect(mockedPost).toHaveBeenCalledWith('/orders/42/cancel')
    expect(result.status).toBe('CANCELLED')
    // cancelledAt → completedAt 흡수 검증
    expect(result.completedAt).toBe('2026-06-10T11:00:00.000Z')
  })

  it('응답이 OrderResponse 스키마에 맞지 않으면 Zod 에러', async () => {
    mockedPost.mockResolvedValueOnce({ data: { status: 9999 } })
    await expect(orderApi.cancelOrder('42')).rejects.toThrow()
  })
})

describe('buildCreateOrderRequest', () => {
  it('pickup asap → type ASAP (time 없음)', () => {
    const body = buildCreateOrderRequest({ ...prepareInput, pickup: { type: 'asap' } })
    expect(body.pickup.type).toBe('ASAP')
    expect(body.pickup.time).toBeUndefined()
  })

  it('pickup slot → type SLOT + time 포함', () => {
    const body = buildCreateOrderRequest({
      ...prepareInput,
      pickup: { type: 'slot', time: '18:30' },
    })
    expect(body.pickup.type).toBe('SLOT')
    expect(body.pickup.time).toBe('18:30')
  })

  it('item kind 소문자 → 대문자 변환', () => {
    const body = buildCreateOrderRequest(prepareInput)
    expect(body.items[0].kind).toBe('DEAL')
  })

  it('paymentAgreed 항상 true', () => {
    const body = buildCreateOrderRequest(prepareInput)
    expect(body.paymentAgreed).toBe(true)
  })

  it('couponId 있으면 userCouponId 포함', () => {
    const body = buildCreateOrderRequest({ ...prepareInput, couponId: 5 })
    expect(body.userCouponId).toBe(5)
  })

  it('couponId 없으면 userCouponId 없음', () => {
    const body = buildCreateOrderRequest(prepareInput)
    expect(body.userCouponId).toBeUndefined()
  })

  it('finalAmount 있으면 amounts.finalAmount 포함', () => {
    const body = buildCreateOrderRequest({
      ...prepareInput,
      amounts: { ...prepareInput.amounts, finalAmount: 4100 },
    })
    expect(body.amounts.finalAmount).toBe(4100)
  })

  it('finalAmount 없으면 amounts.finalAmount 없음', () => {
    const body = buildCreateOrderRequest(prepareInput)
    expect(body.amounts.finalAmount).toBeUndefined()
  })
})
