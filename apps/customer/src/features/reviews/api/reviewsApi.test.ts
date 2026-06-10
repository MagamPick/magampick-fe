import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reviewsApi } from './reviewsApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))
const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)
const mockedPut = vi.mocked(apiClient.put)
const mockedDelete = vi.mocked(apiClient.delete)

// ─── BE 응답 픽스처 ───────────────────────────────────────────────────────────

/** MyReviewResponse (BE 스키마 — number id, 한국어 tags, kind 대소문자 혼용) */
const beReview = {
  id: 1,
  storeId: 10,
  storeName: '브레드샵',
  items: [{ productId: 100, kind: 'deal', name: '크루아상' }],
  rating: 5,
  content: '맛있어요',
  tags: ['맛있어요', '재구매'],
  photos: [],
  createdAt: '2026-06-10T10:00:00Z',
  ownerReply: null,
}

/** ReviewableOrderResponse (BE 스키마 — number ids) */
const beOrder = {
  orderId: 42,
  storeId: 10,
  storeName: '브레드샵',
  items: [{ productId: 100, kind: 'menu', name: '크루아상' }],
  pickedUpAt: '2026-06-10T09:00:00Z',
  reviewed: false,
  reviewId: null,
}

describe('reviewsApi.listMyReviews', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /customers/me/reviews 를 호출하고 매핑된 목록을 반환한다', async () => {
    mockedGet.mockResolvedValueOnce({ data: [beReview] })
    const result = await reviewsApi.listMyReviews()
    expect(mockedGet).toHaveBeenCalledWith('/customers/me/reviews')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')          // number → string
    expect(result[0].storeId).toBe('10')    // number → string
    expect(result[0].storeName).toBe('브레드샵')
    expect(result[0].tags).toEqual(['맛있어요', '재구매']) // 한국어 라벨 그대로
    expect(result[0].items[0].productId).toBe('100')
    expect(result[0].items[0].kind).toBe('deal')
  })

  it('응답이 배열이 아니면 Zod 에러', async () => {
    mockedGet.mockResolvedValueOnce({ data: { invalid: true } }) // 배열 아님
    await expect(reviewsApi.listMyReviews()).rejects.toThrow()
  })
})

describe('reviewsApi.listReviewableOrders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /orders/reviewable 를 호출하고 매핑된 목록을 반환한다', async () => {
    mockedGet.mockResolvedValueOnce({ data: [beOrder] })
    const result = await reviewsApi.listReviewableOrders()
    expect(mockedGet).toHaveBeenCalledWith('/orders/reviewable')
    expect(result).toHaveLength(1)
    expect(result[0].orderId).toBe('42')    // number → string
    expect(result[0].storeId).toBe('10')    // number → string
    expect(result[0].reviewed).toBe(false)
    expect(result[0].reviewId).toBeNull()
    expect(result[0].items[0].kind).toBe('menu')
  })

  it('reviewId 있으면 string 으로 변환', async () => {
    mockedGet.mockResolvedValueOnce({ data: [{ ...beOrder, reviewed: true, reviewId: 99 }] })
    const result = await reviewsApi.listReviewableOrders()
    expect(result[0].reviewId).toBe('99')
  })
})

describe('reviewsApi.getReviewByOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('204 응답이면 null 반환', async () => {
    mockedGet.mockResolvedValueOnce({ status: 204, data: '' })
    const result = await reviewsApi.getReviewByOrder('42')
    expect(result).toBeNull()
  })

  it('data 없으면 null 반환', async () => {
    mockedGet.mockResolvedValueOnce({ status: 200, data: null })
    const result = await reviewsApi.getReviewByOrder('42')
    expect(result).toBeNull()
  })

  it('200 + 리뷰 데이터이면 매핑된 리뷰 반환', async () => {
    mockedGet.mockResolvedValueOnce({ status: 200, data: beReview })
    const result = await reviewsApi.getReviewByOrder('42')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('1')
  })
})

describe('reviewsApi.createReview', () => {
  beforeEach(() => vi.clearAllMocks())

  it('POST /orders/:orderId/reviews 를 호출하고 태그를 enum 코드로 변환한다', async () => {
    mockedPost.mockResolvedValueOnce({ data: beReview })
    const result = await reviewsApi.createReview({
      orderId: '42',
      rating: 5,
      content: '맛있어요!',
      tags: ['맛있어요', '재구매'],
      photos: [],
    })
    expect(mockedPost).toHaveBeenCalledWith('/orders/42/reviews', {
      rating: 5,
      content: '맛있어요!',
      tags: ['DELICIOUS', 'REORDER'], // 한국어 → enum 코드
      photos: [],
    })
    expect(result.id).toBe('1')
    expect(result.storeName).toBe('브레드샵')
  })

  it('content 는 trim 해서 전송', async () => {
    mockedPost.mockResolvedValueOnce({ data: beReview })
    await reviewsApi.createReview({ orderId: '42', rating: 4, content: '  후기  ', tags: [], photos: [] })
    expect(mockedPost).toHaveBeenCalledWith('/orders/42/reviews', expect.objectContaining({ content: '후기' }))
  })

  it('알 수 없는 태그 라벨은 필터', async () => {
    mockedPost.mockResolvedValueOnce({ data: beReview })
    await reviewsApi.createReview({
      orderId: '42',
      rating: 3,
      content: '',
      tags: ['맛있어요', '존재안함'],
      photos: [],
    })
    expect(mockedPost).toHaveBeenCalledWith('/orders/42/reviews', expect.objectContaining({
      tags: ['DELICIOUS'],
    }))
  })

  it('응답 MyReviewResponse 스키마 불일치 시 Zod 에러', async () => {
    mockedPost.mockResolvedValueOnce({ data: [1, 2, 3] }) // 배열이면 에러
    await expect(
      reviewsApi.createReview({ orderId: '42', rating: 5, content: '', tags: [], photos: [] }),
    ).rejects.toThrow()
  })
})

describe('reviewsApi.updateReview', () => {
  beforeEach(() => vi.clearAllMocks())

  it('PUT /reviews/:reviewId 를 호출하고 태그를 enum 코드로 변환한다', async () => {
    mockedPut.mockResolvedValueOnce({ data: beReview })
    const result = await reviewsApi.updateReview('1', {
      rating: 4,
      content: '수정된 후기',
      tags: ['신선해요', '친절해요'],
      photos: [],
    })
    expect(mockedPut).toHaveBeenCalledWith('/reviews/1', {
      rating: 4,
      content: '수정된 후기',
      tags: ['FRESH', 'KIND'],
      photos: [],
    })
    expect(result.id).toBe('1')
  })

  it('409 (답글잠금) 은 apiClient interceptor 가 ApiError 로 throw', async () => {
    const { ApiError } = await import('@/shared/lib/apiError')
    mockedPut.mockRejectedValueOnce(new ApiError(409, 'REVIEW_LOCKED', '사장님 답글이 달려 수정할 수 없어요'))
    await expect(
      reviewsApi.updateReview('1', { rating: 1, content: '', tags: [], photos: [] }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('reviewsApi.deleteReview', () => {
  beforeEach(() => vi.clearAllMocks())

  it('DELETE /reviews/:reviewId 를 호출한다', async () => {
    mockedDelete.mockResolvedValueOnce({ status: 204, data: '' })
    await reviewsApi.deleteReview('1')
    expect(mockedDelete).toHaveBeenCalledWith('/reviews/1')
  })

  it('409 (답글잠금) 은 ApiError 로 throw', async () => {
    const { ApiError } = await import('@/shared/lib/apiError')
    mockedDelete.mockRejectedValueOnce(new ApiError(409, 'REVIEW_LOCKED', '사장님 답글이 달려 삭제할 수 없어요'))
    await expect(reviewsApi.deleteReview('1')).rejects.toBeInstanceOf(ApiError)
  })
})
