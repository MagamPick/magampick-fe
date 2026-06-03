import { describe, it, expect } from 'vitest'
import {
  calcCouponDiscount,
  classifyCouponStatus,
  couponConditionText,
  couponValueText,
  isCouponUsable,
} from './couponCalc'
import type { Coupon } from '../types'

const NOW = new Date('2026-06-01T09:00:00+09:00') // 오늘 = 2026-06-01

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: 'cp1',
  status: 'usable',
  discountType: 'rate',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
  ...over,
})

describe('classifyCouponStatus', () => {
  it('사용 완료(used)는 그대로 used', () => {
    expect(classifyCouponStatus(coupon({ status: 'used', expiresAt: '2026-06-30' }), NOW)).toBe('used')
  })
  it('만료일이 오늘 이전이면 expired 로 보정', () => {
    expect(classifyCouponStatus(coupon({ status: 'usable', expiresAt: '2026-05-31' }), NOW)).toBe(
      'expired',
    )
  })
  it('만료일이 오늘이면 아직 usable', () => {
    expect(classifyCouponStatus(coupon({ status: 'usable', expiresAt: '2026-06-01' }), NOW)).toBe(
      'usable',
    )
  })
  it('만료일이 미래면 usable', () => {
    expect(classifyCouponStatus(coupon({ expiresAt: '2026-06-30' }), NOW)).toBe('usable')
  })
})

describe('calcCouponDiscount', () => {
  it('정률(rate) — floor(합계 × % / 100)', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'rate', value: 30 }), 10000)).toBe(3000)
  })
  it('정률 — 단수 버림(floor)', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'rate', value: 30 }), 9990)).toBe(2997)
  })
  it('정액(amount) — 그대로 차감', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'amount', value: 2000 }), 10000)).toBe(2000)
  })
  it('정액 — 대상 합계를 넘지 못함(min)', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'amount', value: 2000 }), 1500)).toBe(1500)
  })
  it('대상 합계 0 — 할인 0', () => {
    expect(calcCouponDiscount(coupon({ discountType: 'rate', value: 30 }), 0)).toBe(0)
  })
})

describe('isCouponUsable', () => {
  it('사용 가능 + 최소주문 충족 → true', () => {
    expect(isCouponUsable(coupon({ minOrder: 5000 }), 6000, NOW)).toBe(true)
  })
  it('최소주문 미달 → false', () => {
    expect(isCouponUsable(coupon({ minOrder: 5000 }), 4999, NOW)).toBe(false)
  })
  it('최소주문 경계(동일) → true', () => {
    expect(isCouponUsable(coupon({ minOrder: 5000 }), 5000, NOW)).toBe(true)
  })
  it('일반 상품 합계 0(전액 떨이) → false', () => {
    expect(isCouponUsable(coupon({ minOrder: 0 }), 0, NOW)).toBe(false)
  })
  it('만료된 쿠폰 → false', () => {
    expect(isCouponUsable(coupon({ expiresAt: '2026-05-01' }), 9999, NOW)).toBe(false)
  })
  it('사용 완료 쿠폰 → false', () => {
    expect(isCouponUsable(coupon({ status: 'used' }), 9999, NOW)).toBe(false)
  })
})

describe('couponValueText / couponConditionText', () => {
  it('정률 표시', () => {
    expect(couponValueText(coupon({ discountType: 'rate', value: 30 }))).toBe('30%')
  })
  it('정액 표시(천단위 구분)', () => {
    expect(couponValueText(coupon({ discountType: 'amount', value: 2000 }))).toBe('2,000원')
  })
  it('최소주문 있음', () => {
    expect(couponConditionText(coupon({ minOrder: 5000 }))).toBe('최소 주문 5,000원')
  })
  it('최소주문 없음', () => {
    expect(couponConditionText(coupon({ minOrder: 0 }))).toBe('최소 주문 없음')
  })
})
