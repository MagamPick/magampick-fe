import { calcCartAmounts } from '@/features/cart/lib/calcCartAmounts'
import type { CartItem } from '@/features/cart/types'
import { calcCouponDiscount, isCouponUsable } from '@/features/coupons/lib/couponCalc'
import type { Coupon } from '@/features/coupons/types'

export interface CheckoutAmountsInput {
  items: CartItem[]
  /** 선택한 쿠폰 (없으면 null) */
  coupon: Coupon | null
  /** 입력한 사용 포인트 */
  pointInput: number
  /** 보유 포인트 잔액 */
  pointBalance: number
  /** 만료/사용가능 판정 기준 시각 */
  now: Date
}

export interface CheckoutAmounts {
  /** 정상가 합계 (Σ 원가 × 수량) */
  normalTotal: number
  /** 마감 할인 (떨이 할인분) */
  dealDiscount: number
  /** 상품 결제 합계 (떨이=할인가 / 일반=정가) */
  payProductTotal: number
  /** 일반(menu) 상품 합계 — 쿠폰 적용 대상 */
  menuSubtotal: number
  /** 선택 쿠폰이 실제 적용됐는지 */
  couponApplicable: boolean
  /** 쿠폰 할인액 */
  couponDiscount: number
  /** 쿠폰 적용 후 금액 */
  afterCoupon: number
  /** 포인트 사용 한도 = min(잔액, 쿠폰 적용 후 금액) */
  pointCap: number
  /** 실제 사용 포인트 (한도로 클램프) */
  pointUsed: number
  /** 최종 결제 금액 (≥0) */
  payTotal: number
  /** 적립 예정 포인트 = floor(최종 결제 현금액 × 1%) */
  earnedPoints: number
}

/**
 * 결제 금액 계산 (노션 「쿠폰 사용」 계산 순서):
 * 상품합계(떨이=할인가/일반=정가) → 쿠폰 차감(일반 상품분) → 포인트 차감(전체 잔액 한도) → 최종(≥0).
 * 적립 예정 = 최종 결제 현금액 × 1% floor (전액 쿠폰·포인트 결제 시 0).
 * 기존 calcCartAmounts(상품 합계) 재사용.
 */
export function calcCheckoutAmounts({
  items,
  coupon,
  pointInput,
  pointBalance,
  now,
}: CheckoutAmountsInput): CheckoutAmounts {
  const cart = calcCartAmounts(items)
  const { normalTotal, discountTotal: dealDiscount, payTotal: payProductTotal } = cart

  const menuSubtotal = items
    .filter((i) => i.kind === 'menu')
    .reduce((sum, i) => sum + i.salePrice * i.qty, 0)

  const couponApplicable = coupon ? isCouponUsable(coupon, menuSubtotal, now) : false
  const couponDiscount = couponApplicable && coupon ? calcCouponDiscount(coupon, menuSubtotal) : 0
  const afterCoupon = payProductTotal - couponDiscount

  const pointCap = Math.max(0, Math.min(pointBalance, afterCoupon))
  const safeInput = Number.isFinite(pointInput) ? Math.floor(pointInput) : 0
  const pointUsed = Math.max(0, Math.min(safeInput, pointCap))

  const payTotal = afterCoupon - pointUsed
  const earnedPoints = Math.floor(payTotal / 100)

  return {
    normalTotal,
    dealDiscount,
    payProductTotal,
    menuSubtotal,
    couponApplicable,
    couponDiscount,
    afterCoupon,
    pointCap,
    pointUsed,
    payTotal,
    earnedPoints,
  }
}
