import { describe, it, expect, beforeEach } from 'vitest'
import { favoritesApi, __resetFavoritesStoreForTest } from '@/features/favorites/api/favoritesApi'
import { storeListApi } from './storeListApi'
import type { StoreListItem, StoreSort } from '../types'

/** mock 페이지 크기 — storeListApi 내부 상수와 일치(바뀌면 같이 갱신) */
const PAGE_SIZE = 6

/** 모든 페이지를 커서 끝까지 모아 한 배열로 (정렬 검증용) */
async function fetchAll(sort: StoreSort): Promise<StoreListItem[]> {
  const items: StoreListItem[] = []
  let cursor: number | null = 0
  while (cursor !== null) {
    const page = await storeListApi.getStores({ sort, cursor })
    items.push(...page.items)
    cursor = page.nextCursor
  }
  return items
}

describe('storeListApi.getStores', () => {
  beforeEach(() => __resetFavoritesStoreForTest([]))

  it('cursor_페이징_total_dealStoreCount_노출', async () => {
    const page0 = await storeListApi.getStores({ sort: 'recommended', cursor: 0 })
    expect(page0.items).toHaveLength(PAGE_SIZE)
    expect(page0.nextCursor).toBe(1)
    expect(page0.total).toBe(12)
    expect(page0.dealStoreCount).toBe(9) // 활성 떨이 보유 매장 수

    const page1 = await storeListApi.getStores({ sort: 'recommended', cursor: 1 })
    expect(page1.items).toHaveLength(6)
    expect(page1.nextCursor).toBeNull() // 마지막 페이지
  })

  it('거리순_오름차순', async () => {
    const items = await fetchAll('distance')
    expect(items).toHaveLength(12)
    expect(items[0].id).toBe('st-1') // 0.3km
    for (let i = 1; i < items.length; i++) {
      expect(items[i].distanceKm).toBeGreaterThanOrEqual(items[i - 1].distanceKm)
    }
  })

  it('별점순_내림차순_리뷰0_매장은_뒤로', async () => {
    const items = await fetchAll('rating')
    expect(items[0].rating).toBe(4.9) // 최고 평점
    expect(items[items.length - 1].rating).toBe(0) // 리뷰 0개 매장은 맨 뒤
  })

  it('할인율순_떨이없는_매장은_뒤로', async () => {
    const items = await fetchAll('discount')
    expect(items[0].id).toBe('nb-3') // 최대 할인율 매장
    const dealFlags = items.map((s) => s.activeDealCount > 0)
    // 떨이 보유 매장이 전부 떨이 0개 매장보다 앞에 온다
    expect(dealFlags.lastIndexOf(true)).toBeLessThan(dealFlags.indexOf(false))
  })

  it('마감임박순_가장_임박한_매장_먼저_떨이없으면_뒤로', async () => {
    const items = await fetchAll('closing')
    expect(items[0].id).toBe('nb-3') // 가장 임박
    const dealFlags = items.map((s) => s.activeDealCount > 0)
    expect(dealFlags.lastIndexOf(true)).toBeLessThan(dealFlags.indexOf(false))
  })

  it('추천순_기본_거리순과_다른_순서', async () => {
    const recommended = await fetchAll('recommended')
    expect(recommended[0].id).toBe('st-1')
    const distance = await fetchAll('distance')
    // 추천 점수는 거리+평점+떨이 보너스라 단순 거리순과 달라야 한다
    expect(recommended.map((s) => s.id)).not.toEqual(distance.map((s) => s.id))
  })

  it('단골_여부를_favorites_단일소스에서_join', async () => {
    __resetFavoritesStoreForTest([
      {
        id: 'st-1',
        name: '베이커리 브레드샵',
        imageUrl: null,
        distanceKm: 0.3,
        rating: 4.6,
        activeDealCount: 2,
      },
    ])
    const items = await fetchAll('distance')
    expect(items.find((s) => s.id === 'st-1')!.isFavorite).toBe(true)
    expect(items.find((s) => s.id === 'sl-1')!.isFavorite).toBe(false)
    // 응답 전체가 단일 소스와 일치
    for (const item of items) {
      expect(item.isFavorite).toBe(favoritesApi.isFavorite(item.id))
    }
  })
})
