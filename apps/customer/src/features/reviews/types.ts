import { z } from 'zod'

/**
 * 리뷰 도메인 타입 (노션: 리뷰 작성 / 수정·삭제 / 목록 조회).
 * 픽업 완료 주문 1리뷰 — 별점만 필수, 빠른평가·후기(≤300자)·사진(≤3장) 선택.
 * 매장 상세의 리뷰 '읽기'(store-detail) 와 별개로, 여기서는 '내 리뷰' 와 작성/수정/삭제를 다룬다.
 */

/** 빠른 평가 태그 — 복수 선택(선택). 프로토타입 7개 고정(consumer 52-review-write) */
export const QUICK_TAGS = [
  '맛있어요',
  '신선해요',
  '재구매',
  '픽업 빨라요',
  '양 많아요',
  '가성비',
  '친절해요',
] as const
export type QuickTag = (typeof QUICK_TAGS)[number]

/**
 * FE 한국어 태그 라벨 → BE enum 코드 매핑 (CreateReviewRequest/UpdateReviewRequest.tags).
 * BE 응답(MyReviewResponse.tags)은 한국어 라벨로 오므로 변환 불필요.
 */
export const REVIEW_TAG_CODE: Record<QuickTag, string> = {
  맛있어요: 'DELICIOUS',
  신선해요: 'FRESH',
  재구매: 'REORDER',
  '픽업 빨라요': 'FAST_PICKUP',
  '양 많아요': 'GENEROUS',
  가성비: 'GOOD_VALUE',
  친절해요: 'KIND',
}

/** 후기 상한 — 노션: 하한 없음·최대 300자(프로토타입 "10자/500자"는 교정) */
export const REVIEW_CONTENT_MAX = 300
/** 사진 최대 장수 — 노션: 최대 3장 */
export const REVIEW_PHOTO_MAX = 3

/** 별점 라벨 — 작성 화면 별점 아래 안내 문구(1~5) */
export const RATING_LABELS = ['별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요'] as const

/**
 * 주문 상품 한 건 — 리뷰가 어떤 상품 구매에 대한 것인지 표시 + 상품 상세 링크용.
 * 한 주문에 여러 상품이면 items 가 여러 개. kind 로 상세 경로 분기(deal 마감할인 / menu 일반).
 */
export interface OrderItem {
  productId: string
  kind: 'deal' | 'menu'
  name: string
}

/**
 * 리뷰 작성/수정 폼 검증 (노션 리뷰 작성 정책).
 * - rating: 별점 1~5 필수 (0 = 미선택 → 거부, 제출 버튼 비활성)
 * - content: 선택, 하한 없음, 최대 300자
 * - tags: 빠른평가 복수 선택 (QUICK_TAGS 부분집합)
 * - photos: dataURL 최대 3장 (File→dataURL 은 폼 밖에서 변환 후 주입)
 */
export const reviewFormSchema = z.object({
  rating: z.number().int().min(1, '별점을 선택해 주세요').max(5),
  content: z.string().max(REVIEW_CONTENT_MAX, `${REVIEW_CONTENT_MAX}자 이내로 입력해 주세요`),
  tags: z.array(z.enum(QUICK_TAGS)),
  photos: z.array(z.string()).max(REVIEW_PHOTO_MAX, `사진은 최대 ${REVIEW_PHOTO_MAX}장까지예요`),
})
export type ReviewFormValues = z.infer<typeof reviewFormSchema>

/**
 * 내가 쓴 리뷰 — 매장·주문 맥락 포함.
 * `ownerReply` 가 있으면(답글) 수정·삭제가 잠긴다(노션: 답글 전까지만).
 */
export interface MyReview {
  id: string
  /** 리뷰 대상 매장 */
  storeId: string
  storeName: string
  /** 주문에 포함된 상품들 — 각 상품 상세로 링크 */
  items: OrderItem[]
  /** 별점 1~5 */
  rating: number
  content: string
  /** 빠른평가 태그 (BE 응답 한국어 라벨 그대로) */
  tags: string[]
  /** 첨부 사진 URL */
  photos: string[]
  /** 작성일 (ISO) */
  createdAt: string
  /** 사장 답글 — 있으면 수정·삭제 잠금 */
  ownerReply: string | null
}

/**
 * 리뷰 작성 대상 — 픽업 완료 주문.
 * `reviewed=true` 면 이미 작성 → '리뷰 보기/수정' 진입, false 면 '리뷰 작성'.
 */
export interface ReviewableOrder {
  orderId: string
  storeId: string
  storeName: string
  /** 주문에 포함된 상품들 */
  items: OrderItem[]
  /** 픽업 완료 일시 (ISO) */
  pickedUpAt: string
  /** 이미 리뷰를 썼는지 */
  reviewed: boolean
  /** 작성된 리뷰 id (reviewed=true 일 때만) */
  reviewId: string | null
}

/** 리뷰 작성 페이로드 — 폼값 + 주문 식별 */
export interface CreateReviewPayload {
  orderId: string
  rating: number
  content: string
  tags: string[]
  photos: string[]
}

/** 리뷰 수정 페이로드 — 주문은 고정, 폼값만 변경 */
export type UpdateReviewPayload = Omit<CreateReviewPayload, 'orderId'>
