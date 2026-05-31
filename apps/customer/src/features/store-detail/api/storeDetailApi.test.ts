import { describe, it, expect } from 'vitest'
import { storeDetailApi } from './storeDetailApi'

describe('storeDetailApi (mock)', () => {
  it('매장상세_id별_영업상태_반환_그리고_요일별영업시간_7개', async () => {
    const open = await storeDetailApi.getStoreDetail('st-1')
    expect(open.id).toBe('st-1')
    expect(open.businessStatus).toBe('OPEN')
    expect(open.operatingHours).toHaveLength(7)

    expect((await storeDetailApi.getStoreDetail('st-break')).businessStatus).toBe('BREAK')
    expect((await storeDetailApi.getStoreDetail('st-closed')).businessStatus).toBe('CLOSED_TODAY')
  })

  it('알수없는_id도_기본_OPEN매장_반환_id_보존', async () => {
    const store = await storeDetailApi.getStoreDetail('fv-1')
    expect(store.id).toBe('fv-1')
    expect(store.businessStatus).toBe('OPEN')
    expect(store.name.length).toBeGreaterThan(0)
  })

  it('마감할인_떨이_할인가_원가미만_미래마감_그리고_빈매장은_0건', async () => {
    const deals = await storeDetailApi.getStoreDeals('st-1')
    expect(deals.length).toBeGreaterThan(0)
    const now = Date.now()
    for (const deal of deals) {
      expect(deal.salePrice).toBeLessThan(deal.originalPrice)
      expect(new Date(deal.pickupDeadline).getTime()).toBeGreaterThan(now - 1000)
      expect(deal.stockLeft).toBeGreaterThanOrEqual(0)
    }

    expect(await storeDetailApi.getStoreDeals('st-empty')).toEqual([])
  })

  it('메뉴_카테고리_보유_그리고_빈매장은_0건', async () => {
    const menu = await storeDetailApi.getStoreMenu('st-1')
    expect(menu.length).toBeGreaterThan(0)
    for (const item of menu) {
      expect(item.category.length).toBeGreaterThan(0)
      expect(item.price).toBeGreaterThan(0)
    }

    expect(await storeDetailApi.getStoreMenu('st-empty')).toEqual([])
  })

  it('리뷰요약_5점_분포_5칸_합계_총개수_일치', async () => {
    const summary = await storeDetailApi.getReviewSummary('st-1')
    expect(summary.distribution).toHaveLength(5)
    expect(summary.distribution.map((b) => b.star)).toEqual([5, 4, 3, 2, 1])
    const sum = summary.distribution.reduce((acc, b) => acc + b.count, 0)
    expect(sum).toBe(summary.count)
    expect(summary.average).toBeGreaterThan(0)
    expect(summary.average).toBeLessThanOrEqual(5)

    const empty = await storeDetailApi.getReviewSummary('st-empty')
    expect(empty.count).toBe(0)
  })

  it('리뷰_커서_페이지네이션_끝까지_누적_그리고_빈매장은_빈페이지', async () => {
    let cursor: number | null = 0
    const all: string[] = []
    let guard = 0
    while (cursor !== null && guard < 20) {
      const page = await storeDetailApi.getStoreReviews('st-1', { cursor })
      all.push(...page.items.map((r) => r.id))
      cursor = page.nextCursor
      guard += 1
    }
    expect(all.length).toBeGreaterThan(5) // 여러 페이지에 걸침
    expect(new Set(all).size).toBe(all.length) // 중복 없음

    const empty = await storeDetailApi.getStoreReviews('st-empty', { cursor: 0 })
    expect(empty.items).toEqual([])
    expect(empty.nextCursor).toBeNull()
  })

  it('단골토글_요청한_상태를_그대로_반영', async () => {
    expect(await storeDetailApi.toggleFavorite('st-1', true)).toEqual({ isFavorite: true })
    expect(await storeDetailApi.toggleFavorite('st-1', false)).toEqual({ isFavorite: false })
  })
})
