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

// ─── multipart 헬퍼 ───────────────────────────────────────────────────────────

/** mock 호출 인자 [url, FormData, config] 에서 request JSON 파트와 photos File 파트를 추출 */
async function readMultipart(call: unknown[]) {
  const form = call[1] as FormData
  const request = JSON.parse(await (form.get('request') as Blob).text())
  const photos = form.getAll('photos') as File[]
  const config = call[2] as { headers?: Record<string, string> }
  return { form, request, photos, config }
}

const fileA = new File(['a'], 'a.png', { type: 'image/png' })
const fileB = new File(['b'], 'b.png', { type: 'image/png' })

describe('reviewsApi.createReview', () => {
  beforeEach(() => vi.clearAllMocks())

  it('multipart 로 POST 하고 request 파트에 별점·후기·태그(enum 코드)를 담는다', async () => {
    mockedPost.mockResolvedValueOnce({ data: beReview })
    const result = await reviewsApi.createReview({
      orderId: '42',
      rating: 5,
      content: '맛있어요!',
      tags: ['맛있어요', '재구매'],
      photos: [],
    })

    const [url] = mockedPost.mock.calls[0]
    expect(url).toBe('/orders/42/reviews')
    const { request, photos, config } = await readMultipart(mockedPost.mock.calls[0])
    expect(config.headers).toEqual({ 'Content-Type': 'multipart/form-data' })
    expect(request).toEqual({ rating: 5, content: '맛있어요!', tags: ['DELICIOUS', 'REORDER'] })
    expect(photos).toHaveLength(0) // 새 사진 없음
    expect(result.id).toBe('1')
    expect(result.storeName).toBe('브레드샵')
  })

  it('새로 고른 File 은 photos 파트로 전송', async () => {
    mockedPost.mockResolvedValueOnce({ data: beReview })
    await reviewsApi.createReview({
      orderId: '42',
      rating: 5,
      content: '',
      tags: [],
      photos: [
        { kind: 'new', file: fileA },
        { kind: 'new', file: fileB },
      ],
    })
    const { photos } = await readMultipart(mockedPost.mock.calls[0])
    expect(photos).toHaveLength(2)
    expect(photos[0].name).toBe('a.png')
    expect(photos[1].name).toBe('b.png')
  })

  it('content 는 trim 해서 전송', async () => {
    mockedPost.mockResolvedValueOnce({ data: beReview })
    await reviewsApi.createReview({ orderId: '42', rating: 4, content: '  후기  ', tags: [], photos: [] })
    const { request } = await readMultipart(mockedPost.mock.calls[0])
    expect(request.content).toBe('후기')
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
    const { request } = await readMultipart(mockedPost.mock.calls[0])
    expect(request.tags).toEqual(['DELICIOUS'])
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

  it('multipart 로 PUT 하고 기존 URL 은 keepImageUrls·새 File 은 photos 파트로 분리한다', async () => {
    mockedPut.mockResolvedValueOnce({ data: beReview })
    const result = await reviewsApi.updateReview('1', {
      rating: 4,
      content: '수정된 후기',
      tags: ['신선해요', '친절해요'],
      photos: [
        { kind: 'existing', url: 'https://cdn.example.com/old1.jpg' },
        { kind: 'new', file: fileA },
      ],
    })

    const [url] = mockedPut.mock.calls[0]
    expect(url).toBe('/reviews/1')
    const { request, photos, config } = await readMultipart(mockedPut.mock.calls[0])
    expect(config.headers).toEqual({ 'Content-Type': 'multipart/form-data' })
    expect(request).toEqual({
      rating: 4,
      content: '수정된 후기',
      tags: ['FRESH', 'KIND'],
      keepImageUrls: ['https://cdn.example.com/old1.jpg'], // 기존 사진만
    })
    expect(photos).toHaveLength(1) // 새 File 만
    expect(photos[0].name).toBe('a.png')
    expect(result.id).toBe('1')
  })

  it('새 사진이 없으면 photos 파트는 비고 keepImageUrls 만 전송', async () => {
    mockedPut.mockResolvedValueOnce({ data: beReview })
    await reviewsApi.updateReview('1', {
      rating: 5,
      content: '',
      tags: [],
      photos: [{ kind: 'existing', url: 'https://cdn.example.com/old1.jpg' }],
    })
    const { request, photos } = await readMultipart(mockedPut.mock.calls[0])
    expect(request.keepImageUrls).toEqual(['https://cdn.example.com/old1.jpg'])
    expect(photos).toHaveLength(0)
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
