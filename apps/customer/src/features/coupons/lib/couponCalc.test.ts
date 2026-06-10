import { describe, it, expect } from 'vitest'
import {
  calcCouponDiscount,
  couponConditionText,
  couponValueText,
  isCouponUsable,
} from './couponCalc'
import type { Coupon } from '../types'

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: 1,
  status: 'USABLE',
  discountType: 'RATE',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
  ...over,
})

describe('calcCouponDiscount', () => {
  it('정률(RATE) — floor(합계 × % / 100)', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'RATE', value: 30 }), 10000)).toBe(3000)
  })
  it('정률 — 단수 버림(floor)', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'RATE', value: 30 }), 9990)).toBe(2997)
  })
  it('정액(AMOUNT) — 그대로 차감', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'AMOUNT', value: 2000 }), 10000)).toBe(2000)
  })
  it('정액 — 대상 합계를 넘지 못함(min)', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'AMOUNT', value: 2000 }), 1500)).toBe(1500)
  })
  it('대상 합계 0 — 할인 0', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'RATE', value: 30 }), 0)).toBe(0)
  })
})

describe('isCouponUsable', () => {
  it('USABLE + 최소주문 충족 → true', () => {
    expect(isCouponUsable(coupon({ minOrder: 5000 }), 6000)).toBe(true)
  })
  it('최소주문 미달 → false', () => {
    expect(isCouponUsable(coupon({ minOrder: 5000 }), 4999)).toBe(false)
  })
  it('최소주문 경계(동일) → true', () => {
    expect(isCouponUsable(coupon({ minOrder: 5000 }), 5000)).toBe(true)
  })
  it('일반 상품 합계 0(전액 떨이) → false', () => {
    expect(isCouponUsable(coupon({ minOrder: 0 }), 0)).toBe(false)
  })
  it('EXPIRED 쿠폰 → false (BE status 신뢰)', () => {
    expect(isCouponUsable(coupon({ status: 'EXPIRED' }), 9999)).toBe(false)
  })
  it('USED 쿠폰 → false', () => {
    expect(isCouponUsable(coupon({ status: 'USED' }), 9999)).toBe(false)
  })
  it('최소주문 0(제한 없음) + USABLE → true', () => {
    expect(isCouponUsable(coupon({ minOrder: 0 }), 5000)).toBe(true)
  })
})

describe('couponValueText / couponConditionText', () => {
  it('정률 표시', () => {
    expect(couponValueText(coupon({ discountType: 'RATE', value: 30 }))).toBe('30%')
  })
  it('정액 표시(천단위 구분)', () => {
    expect(couponValueText(coupon({ discountType: 'AMOUNT', value: 2000 }))).toBe('2,000원')
  })
  it('최소주문 있음', () => {
    expect(couponConditionText(coupon({ minOrder: 5000 }))).toBe('최소 주문 5,000원')
  })
  it('최소주문 없음', () => {
    expect(couponConditionText(coupon({ minOrder: 0 }))).toBe('최소 주문 없음')
  })
})
