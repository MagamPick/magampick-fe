import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { storeDetailApi } from './storeDetailApi'

vi.mock('@/shared/lib/axios')

const makeRes = (data: unknown) => ({ data })

const baseStore = {
  id: 1,
  name: '브레드샵',
  imageUrl: null,
  businessStatus: 'OPEN' as const,
  closingTime: '21:00',
  rating: 4.8,
  reviewCount: 412,
  distanceKm: 0.3,
  isFavorite: false,
  address: '서울 마포구',
  phone: '02-1234-5678',
  businessNumber: '123-45-67890',
  operatingHours: [],
  lat: 37.55,
  lng: 126.92,
}

beforeEach(() => vi.clearAllMocks())

describe('storeDetailApi', () => {
  it('getStoreDetail_올바른_엔드포인트_호출_그리고_number_id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(makeRes(baseStore))
    const store = await storeDetailApi.getStoreDetail(1)
    expect(apiClient.get).toHaveBeenCalledWith('/stores/1')
    expect(store.id).toBe(1)
    expect(store.name).toBe('브레드샵')
    expect(store.businessStatus).toBe('OPEN')
    expect(store.isFavorite).toBe(false)
  })

  it('getStoreDetail_closingTime_null_허용_휴무매장', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({ ...baseStore, id: 2, businessStatus: 'CLOSED_TODAY', closingTime: null }),
    )
    const store = await storeDetailApi.getStoreDetail(2)
    expect(store.closingTime).toBeNull()
  })

  it('getStoreDetail_operatingHours_7개_요일', async () => {
    const hours = [
      { day: '월', open: '08:00', close: '21:00', closed: false },
      { day: '화', open: '08:00', close: '21:00', closed: false },
      { day: '수', open: '08:00', close: '21:00', closed: false },
      { day: '목', open: '08:00', close: '21:00', closed: false },
      { day: '금', open: '08:00', close: '21:00', closed: false },
      { day: '토', open: '09:00', close: '21:00', closed: false },
      { day: '일', open: null, close: null, closed: true },
    ]
    vi.mocked(apiClient.get).mockResolvedValue(makeRes({ ...baseStore, operatingHours: hours }))
    const store = await storeDetailApi.getStoreDetail(1)
    expect(store.operatingHours).toHaveLength(7)
  })

  it('getStoreDeals_올바른_엔드포인트_그리고_number_id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes([
        {
          id: 1,
          name: '크루아상 세트',
          imageUrl: null,
          discountRate: 50,
          originalPrice: 9000,
          salePrice: 4500,
          pickupDeadline: new Date(Date.now() + 600_000).toISOString(),
          stockLeft: 5,
        },
      ]),
    )
    const deals = await storeDetailApi.getStoreDeals(1)
    expect(apiClient.get).toHaveBeenCalledWith('/stores/1/clearance-items')
    expect(deals).toHaveLength(1)
    expect(deals[0].id).toBe(1)
    expect(deals[0].salePrice).toBeLessThan(deals[0].originalPrice)
    expect(deals[0].stockLeft).toBeGreaterThanOrEqual(0)
  })

  it('getStoreDeals_빈배열_반환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(makeRes([]))
    expect(await storeDetailApi.getStoreDeals(1)).toEqual([])
  })

  it('getStoreMenu_올바른_엔드포인트_그리고_category_보유', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes([
        { id: 1, name: '소금빵', imageUrl: null, price: 3000, category: '베이커리' },
        { id: 2, name: '아메리카노', imageUrl: null, price: 4000, category: '음료' },
      ]),
    )
    const menu = await storeDetailApi.getStoreMenu(1)
    expect(apiClient.get).toHaveBeenCalledWith('/stores/1/menu')
    expect(menu).toHaveLength(2)
    expect(menu[0].id).toBe(1)
    for (const item of menu) {
      expect(item.category.length).toBeGreaterThan(0)
      expect(item.price).toBeGreaterThan(0)
    }
  })

  it('getReviewSummary_올바른_엔드포인트_5점분포_합계일치', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        average: 4.8,
        count: 412,
        distribution: [
          { star: 5, count: 338 },
          { star: 4, count: 49 },
          { star: 3, count: 16 },
          { star: 2, count: 5 },
          { star: 1, count: 4 },
        ],
      }),
    )
    const summary = await storeDetailApi.getReviewSummary(1)
    expect(apiClient.get).toHaveBeenCalledWith('/stores/1/reviews/summary')
    expect(summary.distribution).toHaveLength(5)
    expect(summary.distribution.map((b) => b.star)).toEqual([5, 4, 3, 2, 1])
    const sum = summary.distribution.reduce((acc, b) => acc + b.count, 0)
    expect(sum).toBe(summary.count)
    expect(summary.average).toBeGreaterThan(0)
  })

  it('getStoreReviews_offset_응답_content→items_transform', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        content: [
          {
            id: 1,
            authorNickname: '빵순이',
            rating: 5,
            content: '좋아요',
            createdAt: new Date().toISOString(),
            products: [],
            photos: [],
            tags: [],
          },
        ],
        page: 0,
        size: 10,
        hasNext: false,
      }),
    )
    const page = await storeDetailApi.getStoreReviews(1, { page: 0 })
    expect(apiClient.get).toHaveBeenCalledWith('/stores/1/reviews', {
      params: { page: 0, size: 10 },
    })
    expect(page.items).toHaveLength(1)
    expect(page.items[0].id).toBe(1)
    expect(page.hasNext).toBe(false)
    expect(page.page).toBe(0)
  })

  it('getStoreReviews_hasNext_true_다음페이지_있음', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({ content: [], page: 0, size: 10, hasNext: true }),
    )
    const page = await storeDetailApi.getStoreReviews(1)
    expect(page.hasNext).toBe(true)
  })
})
