import { describe, it, expect, vi, beforeEach } from 'vitest'
import { homeApi } from './homeApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'

const mockClosingDeal = {
  id: 1,
  storeName: '데일리 브레드',
  productName: '호밀 식빵',
  imageUrl: null,
  discountRate: 40,
  originalPrice: 7500,
  salePrice: 4500,
  pickupDeadline: new Date(Date.now() + 15 * 60_000).toISOString(),
}

const mockNeighborhoodStore = {
  id: 2,
  name: '북카페 무드',
  imageUrl: null,
  distanceKm: 0.6,
  rating: 4.8,
  activeDealCount: 2,
}

beforeEach(() => {
  vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
})

describe('homeApi (실 BE)', () => {
  describe('getClosingDeals', () => {
    it('올바른_엔드포인트_호출', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
      await homeApi.getClosingDeals()
      expect(apiClient.get).toHaveBeenCalledWith('/clearance-items/closing-soon')
    })

    it('마감임박_목록_파싱_id_number', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockClosingDeal] })
      const deals = await homeApi.getClosingDeals()

      expect(deals).toHaveLength(1)
      expect(typeof deals[0].id).toBe('number')
      expect(deals[0].id).toBe(1)
      expect(deals[0].storeName).toBe('데일리 브레드')
      expect(deals[0].salePrice).toBeLessThan(deals[0].originalPrice)
    })

    it('imageUrl_absent이면_null로_변환', async () => {
      const dealWithoutImage = { ...mockClosingDeal }
      delete (dealWithoutImage as Record<string, unknown>).imageUrl
      vi.mocked(apiClient.get).mockResolvedValue({ data: [dealWithoutImage] })

      const deals = await homeApi.getClosingDeals()
      expect(deals[0].imageUrl).toBeNull()
    })

    it('빈_배열_반환_처리', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
      const deals = await homeApi.getClosingDeals()
      expect(deals).toHaveLength(0)
    })
  })

  describe('getNeighborhoodStores', () => {
    it('올바른_엔드포인트_호출', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
      await homeApi.getNeighborhoodStores()
      expect(apiClient.get).toHaveBeenCalledWith('/stores/neighborhood')
    })

    it('동네_마감픽_목록_파싱_id_number', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockNeighborhoodStore] })
      const stores = await homeApi.getNeighborhoodStores()

      expect(stores).toHaveLength(1)
      expect(typeof stores[0].id).toBe('number')
      expect(stores[0].id).toBe(2)
      expect(stores[0].name).toBe('북카페 무드')
      expect(stores[0].rating).toBeGreaterThan(0)
    })

    it('imageUrl_absent이면_null로_변환', async () => {
      const storeWithoutImage = { ...mockNeighborhoodStore }
      delete (storeWithoutImage as Record<string, unknown>).imageUrl
      vi.mocked(apiClient.get).mockResolvedValue({ data: [storeWithoutImage] })

      const stores = await homeApi.getNeighborhoodStores()
      expect(stores[0].imageUrl).toBeNull()
    })
  })
})
