import { describe, it, expect } from 'vitest'
import { orderApi, type CreateOrderInput } from './orderApi'

const input: CreateOrderInput = {
  store: { id: 'st-1', name: '브레드샵' },
  items: [
    { id: 'd1', kind: 'deal', name: '크루아상 세트', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 2 },
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
