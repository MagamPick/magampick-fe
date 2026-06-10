import { z } from 'zod'

/**
 * 쿠폰 도메인 타입 (노션: 쿠폰 발급/쿠폰함/사용/소멸, Phase 8).
 * 발급 경로 = 관리자 이벤트 다운로드 + 가입 축하 자동 지급.
 * 1주문 1쿠폰, 일반 상품 금액만(떨이 제외), 전 매장·전 카테고리 공통.
 * BE coupon 도메인 실연동. 소멸 판정은 BE status(EXPIRED) 신뢰.
 */

/** 쿠폰 상태 — 사용 가능 / 사용 완료 / 만료 (BE UPPERCASE 그대로) */
export const couponStatusSchema = z.enum(['USABLE', 'USED', 'EXPIRED'])
export type CouponStatus = z.infer<typeof couponStatusSchema>

/** 상태 → 한국어 라벨 (쿠폰함 탭) */
export const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  USABLE: '사용 가능',
  USED: '사용 완료',
  EXPIRED: '만료',
}

/** 할인 종류 — 정률(RATE, %) / 정액(AMOUNT, 원) (BE UPPERCASE 그대로) */
export const couponDiscountTypeSchema = z.enum(['RATE', 'AMOUNT'])
export type CouponDiscountType = z.infer<typeof couponDiscountTypeSchema>

/** 보유 쿠폰 (쿠폰함, BE CouponResponse) */
export const couponSchema = z.object({
  id: z.number(),
  status: couponStatusSchema,
  discountType: couponDiscountTypeSchema,
  /** RATE=할인율(%, 1~100), AMOUNT=할인액(원) */
  value: z.number(),
  /** 최소 주문액 (0 = 제한 없음) — 일반 상품 합계 기준 */
  minOrder: z.number(),
  label: z.string(),
  /** 만료일 (YYYY-MM-DD) */
  expiresAt: z.string(),
})
export type Coupon = z.infer<typeof couponSchema>

/** 이벤트 — 받을 수 있는 쿠폰(마이→이벤트). 받으면 쿠폰함에 USABLE 쿠폰으로 추가 (BE CouponEventResponse) */
export const couponEventSchema = z.object({
  couponId: z.number(),
  discountType: couponDiscountTypeSchema,
  value: z.number(),
  minOrder: z.number(),
  label: z.string(),
  expiresAt: z.string(),
  /** 이미 발급 받았으면 true */
  claimed: z.boolean(),
})
export type CouponEvent = z.infer<typeof couponEventSchema>

/** 쿠폰함 탭별 개수 (사용 가능/완료/만료) */
export const couponCountsSchema = z.object({
  USABLE: z.number(),
  USED: z.number(),
  EXPIRED: z.number(),
})
export type CouponCounts = z.infer<typeof couponCountsSchema>
