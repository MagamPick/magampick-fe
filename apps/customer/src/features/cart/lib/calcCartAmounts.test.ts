import { describe, it, expect } from 'vitest'
import { calcCartAmounts } from './calcCartAmounts'
import type { CartItem } from '../types'

const deal = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'd1',
  kind: 'deal',
  name: '떨이 빵',
  imageUrl: null,
  originalPrice: 10000,
  salePrice: 6000,
  qty: 1,
  ...over,
})
const menu = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'm1',
  kind: 'menu',
  name: '일반 빵',
  imageUrl: null,
  originalPrice: 5000,
  salePrice: 5000,
  qty: 1,
  ...over,
})

describe('calcCartAmounts', () => {
  it('빈_장바구니는_모두_0', () => {
    expect(calcCartAmounts([])).toEqual({ normalTotal: 0, discountTotal: 0, payTotal: 0 })
  })

  it('떨이는_할인액_반영하고_결제예정은_할인가', () => {
    const r = calcCartAmounts([deal({ qty: 2 })]) // 정상 20000 / 결제 12000
    expect(r.normalTotal).toBe(20000)
    expect(r.discountTotal).toBe(8000)
    expect(r.payTotal).toBe(12000)
  })

  it('일반상품은_할인액0', () => {
    expect(calcCartAmounts([menu({ qty: 3 })])).toEqual({
      normalTotal: 15000,
      discountTotal: 0,
      payTotal: 15000,
    })
  })

  it('떨이_일반_혼합_합산', () => {
    // 정상 10000 + 10000 = 20000 / 결제 6000 + 10000 = 16000 / 할인 4000
    expect(calcCartAmounts([deal({ qty: 1 }), menu({ qty: 2 })])).toEqual({
      normalTotal: 20000,
      discountTotal: 4000,
      payTotal: 16000,
    })
  })
})
