import { z } from 'zod'

// ─── BE enum (실측 직렬화) ───────────────────────────────────────────────────
/** 쿠폰 할인 종류 — 대문자 직렬화 (RATE=퍼센트 / AMOUNT=정액) */
export const couponDiscountTypeSchema = z.enum(['RATE', 'AMOUNT'])
export type CouponDiscountType = z.infer<typeof couponDiscountTypeSchema>

/** 이벤트 상태 — 소문자, BE 조회 시 도출 (저장 X) */
export const eventStatusSchema = z.enum(['scheduled', 'ongoing', 'ended'])
export type EventStatus = z.infer<typeof eventStatusSchema>

// ─── BE 응답 (AdminCouponResponse) ──────────────────────────────────────────
/**
 * 손작성 Zod (api-types 에 admin 그룹 없음).
 * issueLimit 만 null 가능(무제한) → nullable. 나머지 필드는 BE 계약상 항상 채워짐.
 */
export const adminCouponResponseSchema = z.object({
  id: z.number(),
  label: z.string(),
  discountType: couponDiscountTypeSchema,
  value: z.number(),
  minOrder: z.number(),
  validUntil: z.string(), // yyyy-MM-dd
  issueLimit: z.number().nullable(), // null = 무제한
  issuedCount: z.number(),
  active: z.boolean(),
  displayStartAt: z.string(), // yyyy-MM-dd
  displayEndAt: z.string(), // yyyy-MM-dd
  status: eventStatusSchema,
})
export type AdminCouponResponse = z.infer<typeof adminCouponResponseSchema>

/** FE 도메인 — 응답과 1:1 (매핑 항등; issueLimit number|null 유지) */
export type EventView = AdminCouponResponse

// ─── 생성/수정 payload (FE 도메인) ──────────────────────────────────────────
/**
 * 폼 → api 계층으로 넘기는 정규화 payload. value 를 보유하고,
 * 수정 직렬화 시에만 api 계층에서 discountValue 로 매핑한다(⚠ BE 필드명 불일치).
 */
export interface EventMutationPayload {
  label: string
  discountType: CouponDiscountType
  value: number
  minOrder: number
  validUntil: string
  issueLimit: number | null // null = 무제한
  displayStartAt: string
  displayEndAt: string
}
export type EventCreatePayload = EventMutationPayload
export type EventUpdatePayload = EventMutationPayload
