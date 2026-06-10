import { describe, it, expect, beforeEach, vi } from 'vitest'
import { orderApi, resetOrderState, buildCreateOrderRequest, type CreateOrderInput } from './orderApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}))
const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)

const input: CreateOrderInput = {
  store: { id: 'st-1', name: '브레드샵' },
  items: [
    {
      id: 'd1',
      kind: 'deal',
      name: '크루아상 세트',
      imageUrl: null,
      originalPrice: 10000,
      salePrice: 6000,
      qty: 2,
    },
  ],
  pickup: { type: 'asap' },
  memo: '포장 부탁드려요',
  amounts: { normalTotal: 20000, discountTotal: 8000, payTotal: 12000 },
  paymentKey: 'stub_12000_1',
}

describe('orderApi.create (mock)', () => {
  it('주문접수_상태와_4자리_픽업코드로_생성', async () => {
    const order = await orderApi.create(input)
    expect(order.status).toBe('PENDING')
    expect(order.pickupCode).toMatch(/^\d{4}$/)
    expect(order.paymentMethod).toBe('toss')
  })

  it('장바구니_내용을_그대로_담는다', async () => {
    const order = await orderApi.create(input)
    expect(order.storeName).toBe('브레드샵')
    expect(order.items).toHaveLength(1)
    expect(order.memo).toBe('포장 부탁드려요')
    expect(order.amounts.payTotal).toBe(12000)
    expect(order.pickup).toEqual({ type: 'asap' })
  })
})

describe('orderApi.requestRefund (mock)', () => {
  beforeEach(() => resetOrderState())

  it('픽업_완료_주문에_사유와_함께_요청하면_REQUESTED', async () => {
    const order = await orderApi.requestRefund('o_s4', '받아보니 상태가 좋지 않아요')
    expect(order.refund?.status).toBe('REQUESTED')
    expect(order.refund?.reason).toBe('받아보니 상태가 좋지 않아요')
    expect(order.refund?.requestedAt).toBeTruthy()
  })

  it('이미_환불_요청한_주문은_재요청_불가', async () => {
    await expect(orderApi.requestRefund('o_s6', '또 요청')).rejects.toThrow('이미 환불')
  })

  it('픽업_완료가_아닌_주문은_요청_불가', async () => {
    await expect(orderApi.requestRefund('o_s1', '사유')).rejects.toThrow('픽업 완료')
  })

  it('환불_가능_기간이_지난_완료주문은_요청_불가', async () => {
    await expect(orderApi.requestRefund('o_s9', '사유')).rejects.toThrow('기간')
  })

  it('사유가_비면_요청_불가', async () => {
    await expect(orderApi.requestRefund('o_s4', '   ')).rejects.toThrow('사유')
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
})
