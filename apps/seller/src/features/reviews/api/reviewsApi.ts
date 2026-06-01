import { ApiError } from '@/shared/lib/apiError'
import { REPLY_CONTENT_MAX } from '../types'
import type { ReviewSummary, SellerReview } from '../types'

/**
 * ⚠️ Mock 스텁 — 리뷰 BE 미구현(review 도메인 없음). in-memory 로 상태 유지.
 * 실연동 시 apiClient 호출 + Zod 응답 검증으로 교체(api-client-convention).
 * 권한(본인 소유 매장만)은 BE/연동 책임 — mock 은 단일 매장 가정(storeId 무시).
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?w=240&h=240&fit=crop&q=80`

/** 데모 시드 — 8건(답글 6 / 미답글 2). 일부 주문은 상품 2개·사진 첨부. 프로토타입 50-reviews 기반 */
function seed(): SellerReview[] {
  return [
    {
      id: 'srv-1',
      authorNickname: '빵순이님',
      rating: 5,
      content: '크루아상이 정말 고소하고 맛있어요. 마감 시간에 이렇게 저렴하게 사다니!',
      createdAt: '2026-05-20T11:00:00+09:00',
      products: [{ name: '버터 크루아상' }, { name: '아메리카노' }],
      photos: [
        UNSPLASH('photo-1555507036-ab1f4038808a'),
        UNSPLASH('photo-1509440159596-0249088772ff'),
      ],
      tags: ['친절해요', '신선해요', '재구매'],
      ownerReply: '맛있게 드셔주셔서 감사해요! 또 들러주세요 🥐',
    },
    {
      id: 'srv-2',
      authorNickname: '단골손님님',
      rating: 4,
      content: '양도 많고 좋아요. 다음에 또 이용할게요.',
      createdAt: '2026-05-19T18:30:00+09:00',
      products: [{ name: '우유 식빵' }],
      photos: [UNSPLASH('photo-1568827999250-3f6afff96e66')],
      tags: ['양 많아요', '가성비'],
      ownerReply: null,
    },
    {
      id: 'srv-3',
      authorNickname: '김모닝님',
      rating: 5,
      content: '사장님이 친절하시고 빵도 신선했어요.',
      createdAt: '2026-05-19T09:10:00+09:00',
      products: [{ name: '아메리카노' }],
      photos: [],
      tags: ['친절해요', '신선해요'],
      ownerReply: '감사합니다! 항상 신선하게 준비할게요 😊',
    },
    {
      id: 'srv-4',
      authorNickname: '라라님',
      rating: 3,
      content: '빵은 맛있는데 픽업 시간이 조금 빠듯했어요.',
      createdAt: '2026-05-18T20:05:00+09:00',
      products: [{ name: '단팥빵' }, { name: '소금빵' }],
      photos: [],
      tags: ['맛있어요'],
      ownerReply: null,
    },
    {
      id: 'srv-5',
      authorNickname: '빵빵이님',
      rating: 5,
      content: '소금빵 겉바속촉! 가격도 착해요.',
      createdAt: '2026-05-17T15:40:00+09:00',
      products: [{ name: '소금빵' }],
      photos: [],
      tags: ['재구매', '가성비'],
      ownerReply: '또 만나요! 감사합니다 🧂',
    },
    {
      id: 'srv-6',
      authorNickname: '모닝커피님',
      rating: 4,
      content: '라떼 부드럽고 좋네요.',
      createdAt: '2026-05-16T08:20:00+09:00',
      products: [{ name: '카페라떼' }],
      photos: [],
      tags: ['신선해요'],
      ownerReply: '맛있게 드셨다니 기뻐요 ☕',
    },
    {
      id: 'srv-7',
      authorNickname: '단짠러버님',
      rating: 2,
      content: '도넛이 생각보다 달았어요.',
      createdAt: '2026-05-15T13:00:00+09:00',
      products: [{ name: '글레이즈드 도넛' }],
      photos: [],
      tags: [],
      ownerReply: null,
    },
    {
      id: 'srv-8',
      authorNickname: '빵식이님',
      rating: 5,
      content: '베이글 쫀득하고 푸짐해요!',
      createdAt: '2026-05-14T10:30:00+09:00',
      products: [{ name: '플레인 베이글' }, { name: '어니언 베이글' }],
      photos: [],
      tags: ['양 많아요', '친절해요'],
      ownerReply: '감사합니다! 다음에도 푸짐하게 드릴게요 🥯',
    },
  ]
}

let reviews: SellerReview[] = seed()

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetReviewsForTest() {
  reviews = seed()
}

export const reviewsApi = {
  /** 매장 리뷰 목록 — 최신순(seed 순서). mock 은 단일 매장이라 storeId 무관 */
  async listStoreReviews(): Promise<SellerReview[]> {
    await delay(300)
    return clone(reviews)
  },

  /** 리뷰 요약 — 평균·총개수·답글률. mock 은 단일 매장이라 storeId 무관 */
  async getReviewSummary(): Promise<ReviewSummary> {
    await delay(250)
    const total = reviews.length
    const average = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
    const replied = reviews.filter((r) => r.ownerReply !== null).length
    return {
      average: Math.round(average * 10) / 10,
      total,
      replyRate: total ? Math.round((replied / total) * 100) : 0,
    }
  },

  /** 리뷰 답글 — 리뷰당 1개(중복 거부), 내용 필수 */
  async replyToReview(reviewId: string, content: string): Promise<SellerReview> {
    await delay(300)
    const review = reviews.find((r) => r.id === reviewId)
    if (!review) {
      throw new ApiError(404, 'REVIEW_NOT_FOUND', '리뷰를 찾을 수 없어요')
    }
    if (review.ownerReply !== null) {
      throw new ApiError(409, 'REPLY_ALREADY_EXISTS', '이미 답글을 작성했어요')
    }
    const trimmed = content.trim()
    if (!trimmed) {
      throw new ApiError(422, 'REPLY_EMPTY', '답글 내용을 입력해 주세요')
    }
    if (trimmed.length > REPLY_CONTENT_MAX) {
      throw new ApiError(422, 'REPLY_TOO_LONG', `답글은 ${REPLY_CONTENT_MAX}자 이내로 입력해 주세요`)
    }
    review.ownerReply = trimmed
    return clone(review)
  },
}
