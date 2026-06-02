import { z } from 'zod'

/**
 * 쿠폰 도메인 타입 (노션: 쿠폰 발급/쿠폰함/사용/소멸, Phase 8).
 * 발급 경로 = 관리자 이벤트 다운로드 + 가입 축하 자동 지급(여기선 mock pre-seed).
 * 1주문 1쿠폰, 일반 상품 금액만(떨이 제외), 전 매장·전 카테고리 공통.
 * 백엔드 coupon 도메인 미구현 → mock. 소멸은 만료일 경과 시 방어 판정/배치(여기선 조회 시 보정).
 */

/** 쿠폰 상태 — 사용 가능 / 사용 완료 / 만료 */
export const couponStatusSchema = z.enum(['usable', 'used', 'expired'])
export type CouponStatus = z.infer<typeof couponStatusSchema>

/** 상태 → 한국어 라벨 (쿠폰함 탭) */
export const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  usable: '사용 가능',
  used: '사용 완료',
  expired: '만료',
}

/** 할인 종류 — 정률(rate, %) / 정액(amount, 원) */
export const couponDiscountTypeSchema = z.enum(['rate', 'amount'])
export type CouponDiscountType = z.infer<typeof couponDiscountTypeSchema>

/** 보유 쿠폰 (쿠폰함) */
export const couponSchema = z.object({
  id: z.string(),
  status: couponStatusSchema,
  discountType: couponDiscountTypeSchema,
  /** rate=할인율(%, 1~100), amount=할인액(원) */
  value: z.number().int().positive(),
  /** 최소 주문액 (0 = 제한 없음) — 일반 상품 합계 기준 */
  minOrder: z.number().int().min(0),
  label: z.string(),
  /** 만료일 (YYYY-MM-DD) */
  expiresAt: z.string(),
})
export type Coupon = z.infer<typeof couponSchema>

/** 이벤트 — 받을 수 있는 쿠폰(마이→이벤트). 받으면 쿠폰함에 usable 쿠폰으로 추가 */
export const couponEventSchema = z.object({
  id: z.string(),
  discountType: couponDiscountTypeSchema,
  value: z.number().int().positive(),
  minOrder: z.number().int().min(0),
  label: z.string(),
  expiresAt: z.string(),
})
export type CouponEvent = z.infer<typeof couponEventSchema>

/** 쿠폰함 탭별 개수 (사용 가능/완료/만료) */
export const couponCountsSchema = z.object({
  usable: z.number().int().min(0),
  used: z.number().int().min(0),
  expired: z.number().int().min(0),
})
export type CouponCounts = z.infer<typeof couponCountsSchema>
