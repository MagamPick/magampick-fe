import { describe, it, expect } from 'vitest'
import { calcCheckoutAmounts } from './calcCheckoutAmounts'
import type { CartItem } from '@/features/cart/types'
import type { Coupon } from '@/features/coupons/types'

const NOW = new Date('2026-06-01T09:00:00+09:00')

const deal = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'd1',
  kind: 'deal',
  name: '딸기 케이크',
  imageUrl: null,
  originalPrice: 10000,
  salePrice: 6000,
  qty: 1,
  ...over,
})
const menu = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'm1',
  kind: 'menu',
  name: '아메리카노',
  imageUrl: null,
  originalPrice: 5000,
  salePrice: 5000,
  qty: 1,
  ...over,
})
const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: 'cp1',
  status: 'usable',
  discountType: 'rate',
  value: 30,
  minOrder: 0,
  label: '쿠폰',
  expiresAt: '2026-12-31',
  ...over,
})

describe('calcCheckoutAmounts', () => {
  it('혜택 없음 — 상품 금액만, 적립 예정 1% floor', () => {
    const a = calcCheckoutAmounts({
      items: [deal()],
      coupon: null,
      pointInput: 0,
      pointBalance: 0,
      now: NOW,
    })
    expect(a.normalTotal).toBe(10000)
    expect(a.dealDiscount).toBe(4000)
    expect(a.payProductTotal).toBe(6000)
    expect(a.couponDiscount).toBe(0)
    expect(a.pointUsed).toBe(0)
    expect(a.payTotal).toBe(6000)
    expect(a.earnedPoints).toBe(60)
  })

  it('쿠폰은 일반(menu) 상품 금액에만 적용 — 떨이 제외', () => {
    const a = calcCheckoutAmounts({
      items: [deal(), menu()], // payProduct 11000, menuSubtotal 5000
      coupon: coupon({ discountType: 'rate', value: 30, minOrder: 0 }),
      pointInput: 0,
      pointBalance: 0,
      now: NOW,
    })
    expect(a.menuSubtotal).toBe(5000)
    expect(a.couponDiscount).toBe(1500) // 30% of 5000
    expect(a.payTotal).toBe(9500) // 11000 - 1500
  })

  it('전액 떨이 주문 — 쿠폰 적용 불가', () => {
    const a = calcCheckoutAmounts({
      items: [deal()],
      coupon: coupon({ discountType: 'amount', value: 2000, minOrder: 0 }),
      pointInput: 0,
      pointBalance: 0,
      now: NOW,
    })
    expect(a.couponApplicable).toBe(false)
    expect(a.couponDiscount).toBe(0)
    expect(a.payTotal).toBe(6000)
  })

  it('최소주문 미달 쿠폰은 무시', () => {
    const a = calcCheckoutAmounts({
      items: [menu({ salePrice: 4000, originalPrice: 4000 })],
      coupon: coupon({ minOrder: 5000 }),
      pointInput: 0,
      pointBalance: 0,
      now: NOW,
    })
    expect(a.couponApplicable).toBe(false)
    expect(a.couponDiscount).toBe(0)
  })

  it('포인트는 쿠폰 적용 후 잔액 한도 내에서 차감', () => {
    const a = calcCheckoutAmounts({
      items: [menu({ salePrice: 10000, originalPrice: 10000 })],
      coupon: coupon({ value: 30, minOrder: 0 }), // 3000 할인
      pointInput: 99999,
      pointBalance: 5000,
      now: NOW,
    })
    expect(a.couponDiscount).toBe(3000)
    expect(a.afterCoupon).toBe(7000)
    expect(a.pointCap).toBe(5000)
    expect(a.pointUsed).toBe(5000)
    expect(a.payTotal).toBe(2000)
    expect(a.earnedPoints).toBe(20)
  })

  it('포인트 입력이 결제 한도 초과 시 한도까지만(클램프), 0원 결제 적립 0', () => {
    const a = calcCheckoutAmounts({
      items: [deal()], // payProduct 6000
      coupon: null,
      pointInput: 10000,
      pointBalance: 10000,
      now: NOW,
    })
    expect(a.pointCap).toBe(6000)
    expect(a.pointUsed).toBe(6000)
    expect(a.payTotal).toBe(0)
    expect(a.earnedPoints).toBe(0)
  })

  it('포인트 음수 입력 → 0', () => {
    const a = calcCheckoutAmounts({
      items: [deal()],
      coupon: null,
      pointInput: -100,
      pointBalance: 5000,
      now: NOW,
    })
    expect(a.pointUsed).toBe(0)
    expect(a.payTotal).toBe(6000)
  })

  it('쿠폰+포인트 동시 — 계산 순서 상품 → 쿠폰 → 포인트', () => {
    const a = calcCheckoutAmounts({
      items: [deal(), menu({ salePrice: 10000, originalPrice: 10000 })], // payProduct 16000, menuSubtotal 10000
      coupon: coupon({ discountType: 'amount', value: 2000, minOrder: 0 }),
      pointInput: 3000,
      pointBalance: 3000,
      now: NOW,
    })
    expect(a.couponDiscount).toBe(2000)
    expect(a.afterCoupon).toBe(14000)
    expect(a.pointUsed).toBe(3000)
    expect(a.payTotal).toBe(11000)
    expect(a.earnedPoints).toBe(110)
  })
})
