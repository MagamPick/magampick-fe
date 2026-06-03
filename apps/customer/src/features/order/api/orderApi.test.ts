import { describe, it, expect, beforeEach } from 'vitest'
import { orderApi, resetOrderState, type CreateOrderInput } from './orderApi'

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
