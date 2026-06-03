import { toYmd } from '@/shared/lib/date'
import type { Coupon, CouponStatus } from '../types'

/**
 * 만료 반영 상태 — used 고정, 만료일 경과(만료일 < 오늘) 시 expired, 그 외 usable.
 * 노션 「쿠폰 소멸」: 배치 일괄 전환 + 조회/결제 시점 방어 판정. mock 은 이 함수로 시점 보정.
 */
export function classifyCouponStatus(coupon: Coupon, now: Date): CouponStatus {
  if (coupon.status === 'used') return 'used'
  if (coupon.expiresAt < toYmd(now)) return 'expired'
  return 'usable'
}

/**
 * 쿠폰 할인액 — 일반(menu) 상품 합계 기준.
 * rate: floor(합계 × value / 100) · amount: min(value, 합계). 대상 합계 0 → 0.
 * (적용 가능 여부는 호출 측에서 isCouponUsable 로 먼저 판정)
 */
export function calcCouponDiscount(coupon: Coupon, menuSubtotal: number): number {
  if (menuSubtotal <= 0) return 0
  if (coupon.discountType === 'rate') return Math.floor((menuSubtotal * coupon.value) / 100)
  return Math.min(coupon.value, menuSubtotal)
}

/**
 * 결제 시 사용 가능 여부 — 사용 가능 상태 + 일반 상품 존재 + 최소주문 충족.
 * 노션 「쿠폰 사용」: 일반 상품 금액만 대상, 최소주문액은 일반 상품 합계 기준, 전액 떨이면 불가.
 */
export function isCouponUsable(coupon: Coupon, menuSubtotal: number, now: Date): boolean {
  if (classifyCouponStatus(coupon, now) !== 'usable') return false
  if (menuSubtotal <= 0) return false
  return menuSubtotal >= coupon.minOrder
}

/** 할인값 표시 — '30%' / '2,000원' (쿠폰·이벤트 공용) */
export function couponValueText(coupon: Pick<Coupon, 'discountType' | 'value'>): string {
  return coupon.discountType === 'rate'
    ? `${coupon.value}%`
    : `${coupon.value.toLocaleString('ko-KR')}원`
}

/** 조건 표시 — '최소 주문 5,000원' / '최소 주문 없음' (쿠폰·이벤트 공용) */
export function couponConditionText(coupon: Pick<Coupon, 'minOrder'>): string {
  return coupon.minOrder > 0
    ? `최소 주문 ${coupon.minOrder.toLocaleString('ko-KR')}원`
    : '최소 주문 없음'
}
