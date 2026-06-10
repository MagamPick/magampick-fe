import { describe, it, expect, beforeEach, vi } from 'vitest'
import { orderApi, resetOrderState, buildCreateOrderRequest, type CreateOrderInput } from './orderApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { post: vi.fn() },
}))
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
    const body = buildCreateOrderRequest({ ...prepareInput, couponId: '5' })
    expect(body.userCouponId).toBe(5)
  })

  it('couponId 없으면 userCouponId 없음', () => {
    const body = buildCreateOrderRequest(prepareInput)
    expect(body.userCouponId).toBeUndefined()
  })
})
