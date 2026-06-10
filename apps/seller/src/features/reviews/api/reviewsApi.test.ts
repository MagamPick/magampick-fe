import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { reviewsApi, computeReviewSummary } from './reviewsApi'
import type { SellerReview } from '../types'

/** BE StoreReviewResponse 단건 픽스처 */
const beReview = {
  id: 1,
  authorNickname: '빵순이님',
  rating: 5,
  content: '크루아상이 정말 고소하고 맛있어요.',
  createdAt: '2026-05-20T11:00:00+09:00',
  products: [
    { productId: 10, kind: 'MENU', name: '버터 크루아상' },
    { productId: 11, kind: 'MENU', name: '아메리카노' },
  ],
  photos: ['https://images.unsplash.com/photo-1509440159596?w=240'],
  tags: ['친절해요', '신선해요', '재구매'],
  ownerReply: null,
}

describe('reviewsApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listStoreReviews', () => {
    it('올바른 URL로 GET 요청하고 SellerReview[]로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beReview] })

      const result = await reviewsApi.listStoreReviews('42')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/42/reviews')
      expect(result).toHaveLength(1)
    })

    it('id number → string 으로 변환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beReview] })

      const result = await reviewsApi.listStoreReviews('42')

      expect(result[0].id).toBe('1')
    })

    it('products 는 name 만 추출한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beReview] })

      const result = await reviewsApi.listStoreReviews('42')

      expect(result[0].products).toEqual([{ name: '버터 크루아상' }, { name: '아메리카노' }])
    })

    it('photos·tags 는 그대로 전달한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beReview] })

      const result = await reviewsApi.listStoreReviews('42')

      expect(result[0].photos).toEqual(['https://images.unsplash.com/photo-1509440159596?w=240'])
      expect(result[0].tags).toEqual(['친절해요', '신선해요', '재구매'])
    })

    it('ownerReply null 이면 null 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [{ ...beReview, ownerReply: null }] })

      const result = await reviewsApi.listStoreReviews('42')

      expect(result[0].ownerReply).toBeNull()
    })

    it('ownerReply 문자열이면 그대로 유지한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beReview, ownerReply: '맛있게 드셔주셔서 감사해요! 또 들러주세요 🥐' }],
      })

      const result = await reviewsApi.listStoreReviews('42')

      expect(result[0].ownerReply).toBe('맛있게 드셔주셔서 감사해요! 또 들러주세요 🥐')
    })

    it('storeId 를 URL 에 포함한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

      await reviewsApi.listStoreReviews('99')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/99/reviews')
    })
  })

  describe('replyToReview', () => {
    it('올바른 URL 과 body 로 POST 요청한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { ...beReview, ownerReply: '감사합니다!' },
      })

      await reviewsApi.replyToReview('1', '감사합니다!')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/reviews/1/reply', {
        content: '감사합니다!',
      })
    })

    it('응답에서 ownerReply 가 채워진 SellerReview 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { ...beReview, ownerReply: '또 방문해주세요!' },
      })

      const result = await reviewsApi.replyToReview('1', '또 방문해주세요!')

      expect(result.ownerReply).toBe('또 방문해주세요!')
      expect(result.id).toBe('1')
    })
  })
})

describe('computeReviewSummary', () => {
  const makeReview = (rating: number, ownerReply: string | null): SellerReview => ({
    id: '1',
    authorNickname: '테스터',
    rating,
    content: '테스트',
    createdAt: '2026-05-20T11:00:00+09:00',
    products: [],
    photos: [],
    tags: [],
    ownerReply,
  })

  it('빈 목록이면 average 0·total 0·replyRate 0 반환', () => {
    expect(computeReviewSummary([])).toEqual({ average: 0, total: 0, replyRate: 0 })
  })

  it('total 은 리뷰 개수', () => {
    const reviews = [makeReview(4, null), makeReview(5, null)]
    expect(computeReviewSummary(reviews).total).toBe(2)
  })

  it('average 는 소수점 1자리 반올림 평균', () => {
    const reviews = [makeReview(4, null), makeReview(5, null)]
    expect(computeReviewSummary(reviews).average).toBe(4.5)
  })

  it('average 는 소수점 1자리로 반올림한다', () => {
    // (3 + 4 + 5) / 3 = 4.0
    const reviews = [makeReview(3, null), makeReview(4, null), makeReview(5, null)]
    expect(computeReviewSummary(reviews).average).toBe(4)
  })

  it('replyRate = 답글 있는 리뷰 / 전체 × 100 (정수 반올림)', () => {
    const reviews = [
      makeReview(5, '감사합니다'),
      makeReview(4, null),
      makeReview(3, null),
      makeReview(5, '또 오세요'),
    ]
    // 2 / 4 * 100 = 50
    expect(computeReviewSummary(reviews).replyRate).toBe(50)
  })

  it('답글이 하나도 없으면 replyRate 0', () => {
    const reviews = [makeReview(4, null), makeReview(5, null)]
    expect(computeReviewSummary(reviews).replyRate).toBe(0)
  })

  it('모두 답글 있으면 replyRate 100', () => {
    const reviews = [makeReview(4, '감사'), makeReview(5, '또 오세요')]
    expect(computeReviewSummary(reviews).replyRate).toBe(100)
  })
})
