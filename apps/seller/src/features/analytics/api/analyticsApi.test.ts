import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { analyticsApi } from './analyticsApi'
import { QUICK_EVAL_TAGS } from '../types'

/** BE AnalyticsResponse 전체 픽스처 */
const beAnalytics = {
  sales: {
    totalSales: 380_000,
    deltaPct: 8,
    chart: [
      { label: '10시', amount: 38_000 },
      { label: '18시', amount: 90_000 },
    ],
    avgOrderValue: 9_500,
    peakHour: '18 ~ 19시',
  },
  orders: { total: 32, pickedUp: 30, canceled: 1, noShow: 1 },
  clearance: { soldQty: 18, savedQty: 18, savedAmount: 41_000, avgDiscountRate: 47 },
  review: {
    avgRating: 4.8,
    newCount: 3,
    replyRate: 100,
    tags: [
      { tag: '친절해요', count: 3 },
      { tag: '신선해요', count: 2 },
      { tag: '맛있어요', count: 2 },
      { tag: '픽업 빨라요', count: 1 },
      { tag: '재구매', count: 1 },
    ],
  },
}

describe('analyticsApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getAnalytics — 4패널 매핑', () => {
    it('올바른 URL로 GET 요청하고 AnalyticsData 4패널로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: beAnalytics })

      const result = await analyticsApi.getAnalytics('1', 'today')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/analytics', {
        params: { period: 'TODAY' },
      })
      // 매출 패널
      expect(result.sales.totalSales).toBe(380_000)
      expect(result.sales.deltaPct).toBe(8)
      expect(result.sales.chart).toHaveLength(2)
      expect(result.sales.chart[0]).toEqual({ label: '10시', amount: 38_000 })
      expect(result.sales.avgOrderValue).toBe(9_500)
      expect(result.sales.peakHour).toBe('18 ~ 19시')
      // 주문 패널
      expect(result.orders.total).toBe(32)
      expect(result.orders.pickedUp).toBe(30)
      expect(result.orders.canceled).toBe(1)
      expect(result.orders.noShow).toBe(1)
      // 떨이 패널
      expect(result.clearance.soldQty).toBe(18)
      expect(result.clearance.savedQty).toBe(18)
      expect(result.clearance.savedAmount).toBe(41_000)
      expect(result.clearance.avgDiscountRate).toBe(47)
      // 리뷰 패널
      expect(result.review.avgRating).toBe(4.8)
      expect(result.review.newCount).toBe(3)
      expect(result.review.replyRate).toBe(100)
    })
  })

  describe('getAnalytics — D1 period 대문자 변환', () => {
    it.each([
      ['today', 'TODAY'],
      ['week', 'WEEK'],
      ['month', 'MONTH'],
      ['year', 'YEAR'],
    ] as const)(
      'FE period "%s" → BE 쿼리 파라미터 "%s" 대문자로 전달된다',
      async (fePeriod, bePeriod) => {
        vi.mocked(apiClient.get).mockResolvedValue({ data: beAnalytics })

        await analyticsApi.getAnalytics('1', fePeriod)

        expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/analytics', {
          params: { period: bePeriod },
        })
      },
    )
  })

  describe('getAnalytics — D4 tags 방어 필터', () => {
    it('QUICK_EVAL_TAGS 외 미등록 라벨은 드롭하고 count desc 순서를 보존한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          ...beAnalytics,
          review: {
            ...beAnalytics.review,
            tags: [
              { tag: '신선해요', count: 8 },
              { tag: '알수없는태그', count: 99 }, // 미등록 라벨 → 드롭
              { tag: '친절해요', count: 3 },
              { tag: '맛있어요', count: 1 },
            ],
          },
        },
      })

      const result = await analyticsApi.getAnalytics('1', 'today')

      const tagNames = result.review.tags.map((t) => t.tag)
      // 방어 필터: 미등록 라벨 제외
      expect(tagNames).not.toContain('알수없는태그')
      // QUICK_EVAL_TAGS 라벨만 포함
      expect(
        tagNames.every((t) => (QUICK_EVAL_TAGS as readonly string[]).includes(t)),
      ).toBe(true)
      // BE count desc 순서 보존 (신선해요=8, 친절해요=3, 맛있어요=1)
      expect(tagNames[0]).toBe('신선해요')
      expect(tagNames[1]).toBe('친절해요')
      expect(tagNames[2]).toBe('맛있어요')
    })

    it('tags 가 빈 배열이면 빈 태그 목록을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          ...beAnalytics,
          review: { ...beAnalytics.review, tags: [] },
        },
      })

      const result = await analyticsApi.getAnalytics('1', 'today')

      expect(result.review.tags).toEqual([])
    })
  })

  describe('getAnalytics — D3 optional 기본값', () => {
    it('모든 패널이 누락된 응답에서 0/[]/\'\' 기본값으로 완전한 AnalyticsData 를 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

      const result = await analyticsApi.getAnalytics('1', 'today')

      expect(result.sales.totalSales).toBe(0)
      expect(result.sales.deltaPct).toBe(0)
      expect(result.sales.chart).toEqual([])
      expect(result.sales.avgOrderValue).toBe(0)
      expect(result.sales.peakHour).toBe('')
      expect(result.orders.total).toBe(0)
      expect(result.orders.pickedUp).toBe(0)
      expect(result.clearance.soldQty).toBe(0)
      expect(result.clearance.savedAmount).toBe(0)
      expect(result.review.avgRating).toBe(0)
      expect(result.review.newCount).toBe(0)
      expect(result.review.tags).toEqual([])
    })

    it('일부 패널 필드 누락 시에도 0 으로 채워 완전한 패널을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          sales: { totalSales: 100_000 }, // 나머지 필드 누락
          orders: {},
          clearance: { soldQty: 5 },
          review: { avgRating: 4.5 },
        },
      })

      const result = await analyticsApi.getAnalytics('1', 'today')

      expect(result.sales.totalSales).toBe(100_000)
      expect(result.sales.deltaPct).toBe(0) // 누락 → 0
      expect(result.sales.chart).toEqual([])  // 누락 → []
      expect(result.orders.total).toBe(0)
      expect(result.clearance.soldQty).toBe(5)
      expect(result.clearance.savedQty).toBe(0) // 누락 → 0
      expect(result.review.avgRating).toBe(4.5)
      expect(result.review.tags).toEqual([]) // 누락 → []
    })
  })
})
