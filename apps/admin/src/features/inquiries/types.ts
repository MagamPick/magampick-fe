import { z } from 'zod'

// ─── 문의 상태 (BE InquiryStatus, 소문자 2종) ─────────────────────────────────
export const inquiryStatusSchema = z.enum(['pending', 'answered'])
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>

// ─── 문의 카테고리 (BE InquiryCategory, 소문자 9종) ───────────────────────────
/**
 * 소비자 문의 카테고리 9종. 필터 select 는 이 고정 목록을 노출한다.
 * ⚠ 응답 파싱은 이 enum 으로 강제하지 않는다 — 미지/신규 값이 와도 목록 전체가
 *   빈화면 되지 않게 inquiryResponseSchema.category 는 z.string()(관대 파싱, §2-4).
 *   라벨은 inquiryFormat 의 매핑 fallback 으로 처리.
 */
export const INQUIRY_CATEGORIES = [
  'payment',
  'order',
  'coupon',
  'account',
  'report',
  'settlement',
  'store',
  'product',
  'etc',
] as const
export const inquiryCategorySchema = z.enum(INQUIRY_CATEGORIES)
export type InquiryCategory = z.infer<typeof inquiryCategorySchema>

// ─── 관리자 답변 (InquiryAnswerResponse, 1문의 1답변) ─────────────────────────
export const inquiryAnswerResponseSchema = z.object({
  content: z.string(),
  answeredAt: z.string(), // yyyy-MM-dd
})
export type InquiryAnswer = z.infer<typeof inquiryAnswerResponseSchema>

// ─── 문의 (InquiryResponse) ──────────────────────────────────────────────────
/**
 * 손작성 Zod (api-types 에 admin 그룹 없음).
 * category 만 관대 파싱(z.string()) — 그 외 필드는 BE 계약상 항상 채워짐. answer 는 미답변 시 null.
 */
export const inquiryResponseSchema = z.object({
  id: z.number(),
  category: z.string(), // ⚠ 관대 파싱 — enum throw 금지
  title: z.string(),
  content: z.string(),
  status: inquiryStatusSchema,
  createdAt: z.string(), // yyyy-MM-dd
  answer: inquiryAnswerResponseSchema.nullable(),
})
/** FE 도메인 — 응답과 1:1 (매핑 항등) */
export type InquiryView = z.infer<typeof inquiryResponseSchema>

// ─── PageResponse<InquiryResponse> ───────────────────────────────────────────
export const inquiryPageSchema = z.object({
  content: z.array(inquiryResponseSchema),
  page: z.number(), // 0-based
  size: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})
export type InquiryPage = z.infer<typeof inquiryPageSchema>

// ─── 목록 조회 파라미터 (FE) ──────────────────────────────────────────────────
export interface InquiryListParams {
  status?: InquiryStatus
  category?: InquiryCategory
  page?: number
  size?: number
}
