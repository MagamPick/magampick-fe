import { z } from 'zod'

/**
 * 고객센터 도메인 (노션 「문의하기」, Phase 11).
 * FAQ 조회 + 1:1 문의 제출·내 문의 내역·답변 조회. 권한 = 로그인 본인 문의만.
 * 백엔드 support 도메인 미구현 → mock. 소비자 support 미러(카테고리·FAQ 는 사장 맥락).
 */

/** FAQ — 정적 seed(아코디언, 한 번에 하나) */
export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
})
export type Faq = z.infer<typeof faqSchema>

/** 1:1 문의 카테고리 (고정 목록 — 사장) */
export const inquiryCategorySchema = z.enum([
  'settlement', // 정산·수수료
  'order', // 주문·픽업
  'store', // 매장 운영
  'product', // 상품·마감할인
  'account', // 계정·로그인
  'etc', // 기타
])
export type InquiryCategory = z.infer<typeof inquiryCategorySchema>

export const INQUIRY_CATEGORY_LABEL: Record<InquiryCategory, string> = {
  settlement: '정산·수수료',
  order: '주문·픽업',
  store: '매장 운영',
  product: '상품·마감할인',
  account: '계정·로그인',
  etc: '기타',
}

/** 문의 상태 — 대기 / 답변완료 (2단계) */
export const inquiryStatusSchema = z.enum(['pending', 'answered'])
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: '답변 대기',
  answered: '답변 완료',
}

/** 관리자 답변 (1문의 1답변) */
export const inquiryAnswerSchema = z.object({
  content: z.string(),
  /** 답변일 (YYYY-MM-DD) */
  answeredAt: z.string(),
})
export type InquiryAnswer = z.infer<typeof inquiryAnswerSchema>

/** 1:1 문의 */
export const inquirySchema = z.object({
  id: z.string(),
  category: inquiryCategorySchema,
  title: z.string(),
  content: z.string(),
  status: inquiryStatusSchema,
  /** 작성일 (YYYY-MM-DD) */
  createdAt: z.string(),
  /** 답변(없으면 null) */
  answer: inquiryAnswerSchema.nullable(),
})
export type Inquiry = z.infer<typeof inquirySchema>

/** 문의 작성 입력 — 카테고리 + 제목(2자↑) + 내용(10자↑) 셋 다 충족해야 제출 (노션 + 프로토타입 일치) */
export const inquiryInputSchema = z.object({
  category: inquiryCategorySchema,
  title: z
    .string()
    .trim()
    .min(2, '제목을 2자 이상 입력해주세요')
    .max(40, '제목은 40자까지 입력할 수 있어요'),
  content: z
    .string()
    .trim()
    .min(10, '내용을 10자 이상 입력해주세요')
    .max(1000, '내용은 1000자까지 입력할 수 있어요'),
})
export type InquiryInput = z.infer<typeof inquiryInputSchema>
