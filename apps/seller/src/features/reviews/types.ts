import { z } from 'zod'

/**
 * 리뷰 도메인 타입 (노션: 리뷰 목록 조회 / 리뷰 답글 작성 — 사장).
 * 사장이 자기 매장 리뷰를 보고 리뷰당 답글 1개를 단다. 답글이 달리면 소비자 수정·삭제가 잠긴다.
 */

/** 사장이 보는 리뷰 — 작성자·별점·상품·본문·태그·사장답글 */
export interface SellerReview {
  id: string
  authorNickname: string
  /** 별점 1~5 */
  rating: number
  content: string
  /** 작성일 (M/D 표기용 ISO) */
  createdAt: string
  /** 주문 상품들 — 어떤 상품에 대한 리뷰인지(배지 n개). seller 는 상품 상세 라우트가 없어 표시만 */
  products: { name: string }[]
  /** 첨부 사진 (URL) */
  photos: string[]
  tags: string[]
  /** 사장 답글 — 없으면 null(답글 버튼), 있으면 답글 표시 */
  ownerReply: string | null
}

/** 리뷰 요약 — 평균·총개수·답글률(%) */
export interface ReviewSummary {
  average: number
  total: number
  /** 답글률 (0~100 정수 %) */
  replyRate: number
}

/** 답글 상한 (노션 미명시 → 합리적 기본값) */
export const REPLY_CONTENT_MAX = 200

/** 답글 작성 폼 검증 — 내용 필수 */
export const replyFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, '답글 내용을 입력해 주세요')
    .max(REPLY_CONTENT_MAX, `${REPLY_CONTENT_MAX}자 이내로 입력해 주세요`),
})
export type ReplyFormValues = z.infer<typeof replyFormSchema>
