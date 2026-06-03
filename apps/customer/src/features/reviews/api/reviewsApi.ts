import { ApiError } from '@/shared/lib/apiError'
import { REVIEW_CONTENT_MAX, REVIEW_PHOTO_MAX } from '../types'
import type { CreateReviewPayload, MyReview, ReviewableOrder, UpdateReviewPayload } from '../types'

/**
 * ⚠️ Mock 스텁 — 리뷰 BE 미구현(review 도메인 없음). in-memory 로 상태 유지.
 * 실연동 시 apiClient 호출 + Zod 응답 검증으로 교체(api-client-convention).
 * 작성/수정/삭제는 '내 리뷰'·'완료주문(reviewed)' 에만 반영 — 매장 상세 리뷰 탭(store-detail)
 * 은 별도 mock 이라 즉시 반영 안 함(BE 연동 시 통합).
 * 상품 id 는 product-detail mock 과 연결(알려진 sd-1/mn-1 + 그 외 id 는 defaultProduct 로 렌더됨).
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?w=240&h=240&fit=crop&q=80`

/** 데모 시드 — 완료주문 3건(미작성 2 + 작성 1), 내 리뷰 3건(답글 1건 → 수정·삭제 잠금) */
function seedOrders(): ReviewableOrder[] {
  return [
    {
      orderId: 'od-1',
      storeId: 'st-1',
      storeName: '베이커리 브레드샵',
      storeEmoji: '🥐',
      items: [
        { productId: 'sd-1', kind: 'deal', name: '크루아상 세트 (4개입)' },
        { productId: 'mn-1', kind: 'menu', name: '플레인 크루아상' },
      ],
      pickedUpAt: '2026-05-29T10:20:00+09:00',
      reviewed: false,
      reviewId: null,
    },
    {
      orderId: 'od-2',
      storeId: 'st-2',
      storeName: '소금빵 연구소',
      storeEmoji: '🧂',
      items: [{ productId: 'rp-salt', kind: 'menu', name: '소금빵' }],
      pickedUpAt: '2026-05-27T18:05:00+09:00',
      reviewed: false,
      reviewId: null,
    },
    {
      orderId: 'od-3',
      storeId: 'st-3',
      storeName: '단팥빵 명가',
      storeEmoji: '🫘',
      items: [
        { productId: 'rp-redbean', kind: 'menu', name: '단팥빵' },
        { productId: 'rp-milk', kind: 'menu', name: '우유 식빵' },
      ],
      pickedUpAt: '2026-05-20T09:40:00+09:00',
      reviewed: true,
      reviewId: 'rv-1',
    },
  ]
}

function seedReviews(): MyReview[] {
  return [
    {
      id: 'rv-1',
      storeId: 'st-3',
      storeName: '단팥빵 명가',
      storeEmoji: '🫘',
      items: [
        { productId: 'rp-redbean', kind: 'menu', name: '단팥빵' },
        { productId: 'rp-milk', kind: 'menu', name: '우유 식빵' },
      ],
      rating: 5,
      content: '단팥이 꽉 차 있고 갓 구운 빵이라 너무 맛있었어요. 마감 할인까지 받아서 행복했어요!',
      tags: ['맛있어요', '재구매'],
      photos: [UNSPLASH('photo-1568254183919-78a4f43a2877')],
      createdAt: '2026-05-21T11:00:00+09:00',
      ownerReply: '맛있게 드셔주셔서 감사해요! 또 들러주세요 🥐',
    },
    {
      id: 'rv-2',
      storeId: 'st-5',
      storeName: '모닝 베이글',
      storeEmoji: '🥯',
      items: [
        { productId: 'rp-bagel', kind: 'menu', name: '플레인 베이글' },
        { productId: 'rp-onion', kind: 'menu', name: '어니언 베이글' },
      ],
      rating: 4,
      content: '베이글이 쫀득하고 좋아요. 다음에 또 살게요.',
      tags: ['신선해요'],
      photos: [
        UNSPLASH('photo-1509440159596-0249088772ff'),
        UNSPLASH('photo-1555507036-ab1f4038808a'),
      ],
      createdAt: '2026-05-18T08:30:00+09:00',
      ownerReply: null,
    },
    {
      id: 'rv-3',
      storeId: 'st-7',
      storeName: '동네 도넛',
      storeEmoji: '🍩',
      items: [{ productId: 'rp-donut', kind: 'menu', name: '글레이즈드 도넛' }],
      rating: 3,
      content: '',
      tags: ['가성비'],
      photos: [],
      createdAt: '2026-05-15T20:10:00+09:00',
      ownerReply: null,
    },
  ]
}

let orders: ReviewableOrder[] = seedOrders()
let reviews: MyReview[] = seedReviews()
let seq = 100

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetReviewsForTest() {
  orders = seedOrders()
  reviews = seedReviews()
  seq = 100
}

/** 작성/수정 공통 입력 검증 — 서버측 미러 검증(별점 필수·후기 상한·사진 장수) */
function assertReviewInput(input: { rating: number; content: string; photos: string[] }) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new ApiError(422, 'REVIEW_INVALID_RATING', '별점을 선택해 주세요')
  }
  if (input.content.length > REVIEW_CONTENT_MAX) {
    throw new ApiError(
      422,
      'REVIEW_CONTENT_TOO_LONG',
      `후기는 ${REVIEW_CONTENT_MAX}자 이내로 입력해 주세요`,
    )
  }
  if (input.photos.length > REVIEW_PHOTO_MAX) {
    throw new ApiError(422, 'REVIEW_TOO_MANY_PHOTOS', `사진은 최대 ${REVIEW_PHOTO_MAX}장까지예요`)
  }
}

export const reviewsApi = {
  /** 내가 쓴 리뷰 — 최신순(신규가 상단) */
  async listMyReviews(): Promise<MyReview[]> {
    await delay(300)
    return clone(reviews)
  },

  /** 리뷰 작성 대상 완료주문 — 픽업 완료 주문 목록 */
  async listReviewableOrders(): Promise<ReviewableOrder[]> {
    await delay(300)
    return clone(orders)
  },

  /** 주문에 연결된 내 리뷰 — 수정 진입 시 기존값 로드(없으면 null) */
  async getReviewByOrder(orderId: string): Promise<MyReview | null> {
    await delay(200)
    const order = orders.find((o) => o.orderId === orderId)
    if (!order?.reviewId) return null
    const review = reviews.find((r) => r.id === order.reviewId)
    return review ? clone(review) : null
  },

  /** 리뷰 작성 — 픽업 완료 주문 1리뷰(재작성 거부), 별점 필수 */
  async createReview(payload: CreateReviewPayload): Promise<MyReview> {
    await delay(400)

    const order = orders.find((o) => o.orderId === payload.orderId)
    if (!order) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', '주문을 찾을 수 없어요')
    }
    if (order.reviewed) {
      throw new ApiError(409, 'REVIEW_ALREADY_EXISTS', '이미 작성한 리뷰가 있어요')
    }
    assertReviewInput(payload)

    const review: MyReview = {
      id: `rv-${seq++}`,
      storeId: order.storeId,
      storeName: order.storeName,
      storeEmoji: order.storeEmoji,
      items: order.items.map((item) => ({ ...item })),
      rating: payload.rating,
      content: payload.content.trim(),
      tags: [...payload.tags],
      photos: [...payload.photos],
      createdAt: new Date().toISOString(),
      ownerReply: null,
    }
    reviews.unshift(review)
    order.reviewed = true
    order.reviewId = review.id
    return clone(review)
  },

  /** 리뷰 수정 — 본인 리뷰, 답글 달리기 전까지만(잠금) */
  async updateReview(reviewId: string, payload: UpdateReviewPayload): Promise<MyReview> {
    await delay(300)

    const review = reviews.find((r) => r.id === reviewId)
    if (!review) {
      throw new ApiError(404, 'REVIEW_NOT_FOUND', '리뷰를 찾을 수 없어요')
    }
    if (review.ownerReply !== null) {
      throw new ApiError(409, 'REVIEW_LOCKED', '사장님 답글이 달려 수정할 수 없어요')
    }
    assertReviewInput(payload)

    review.rating = payload.rating
    review.content = payload.content.trim()
    review.tags = [...payload.tags]
    review.photos = [...payload.photos]
    return clone(review)
  },

  /** 리뷰 삭제 — 본인 리뷰, 답글 전까지만. 연결 주문은 재작성 가능하게 복원 */
  async deleteReview(reviewId: string): Promise<void> {
    await delay(300)

    const review = reviews.find((r) => r.id === reviewId)
    if (!review) {
      throw new ApiError(404, 'REVIEW_NOT_FOUND', '리뷰를 찾을 수 없어요')
    }
    if (review.ownerReply !== null) {
      throw new ApiError(409, 'REVIEW_LOCKED', '사장님 답글이 달려 삭제할 수 없어요')
    }

    reviews = reviews.filter((r) => r.id !== reviewId)
    const order = orders.find((o) => o.reviewId === reviewId)
    if (order) {
      order.reviewed = false
      order.reviewId = null
    }
  },
}
