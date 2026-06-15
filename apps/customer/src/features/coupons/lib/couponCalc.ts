import type { Coupon } from '../types'

/**
 * 쿠폰 할인액 — 일반(menu) 상품 합계 기준.
 * RATE: floor(합계 × value / 100) · AMOUNT: min(value, 합계). 대상 합계 0 → 0.
 * (적용 가능 여부는 호출 측에서 isCouponUsable 로 먼저 판정)
 */
export function calcCouponDiscount(coupon: Coupon, menuSubtotal: number): number {
  if (menuSubtotal <= 0) return 0
  if (coupon.discountType === 'RATE') return Math.floor((menuSubtotal * coupon.value) / 100)
  return Math.min(coupon.value, menuSubtotal)
}

/**
 * 결제 시 사용 가능 여부 — BE status USABLE + 일반 상품 존재 + 최소주문 충족.
 * 노션 「쿠폰 사용」: 일반 상품 금액만 대상, 최소주문액은 일반 상품 합계 기준, 전액 떨이면 불가.
 * BE status 를 신뢰 — 클라이언트 만료 재판정(classifyCouponStatus) 없음.
 */
export function isCouponUsable(coupon: Coupon, menuSubtotal: number): boolean {
  if (coupon.status !== 'USABLE') return false
  if (menuSubtotal <= 0) return false
  return menuSubtotal >= coupon.minOrder
}

/** 할인값 표시 — '30%' / '2,000원' (쿠폰·이벤트 공용) */
export function couponValueText(coupon: Pick<Coupon, 'discountType' | 'value'>): string {
  return coupon.discountType === 'RATE'
    ? `${coupon.value}%`
    : `${coupon.value.toLocaleString('ko-KR')}원`
}

/** 조건 표시 — '최소 주문 5,000원' / '최소 주문 없음' (쿠폰·이벤트 공용) */
export function couponConditionText(coupon: Pick<Coupon, 'minOrder'>): string {
  return coupon.minOrder > 0
    ? `최소 주문 ${coupon.minOrder.toLocaleString('ko-KR')}원`
    : '최소 주문 없음'
}
