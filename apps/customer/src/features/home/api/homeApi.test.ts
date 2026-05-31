import { describe, it, expect } from 'vitest'
import { homeApi } from './homeApi'

describe('homeApi (mock)', () => {
  it('마감임박_최대5개_반환_그리고_60분이내_미래마감', async () => {
    const deals = await homeApi.getClosingDeals()

    expect(deals.length).toBeGreaterThan(0)
    expect(deals.length).toBeLessThanOrEqual(5)

    const now = Date.now()
    for (const deal of deals) {
      const deadline = new Date(deal.pickupDeadline).getTime()
      expect(deadline).toBeGreaterThan(now - 1000) // 미래(약간의 실행 오차 허용)
      expect(deadline).toBeLessThanOrEqual(now + 61 * 60_000) // 60분 이내
      expect(deal.salePrice).toBeLessThan(deal.originalPrice)
    }
  })

  it('동네_마감픽_최대6개_고정_반환', async () => {
    const stores = await homeApi.getNeighborhoodStores()

    expect(stores.length).toBeGreaterThan(0)
    expect(stores.length).toBeLessThanOrEqual(6)
    expect(stores[0].rating).toBeGreaterThan(0)
  })
})
