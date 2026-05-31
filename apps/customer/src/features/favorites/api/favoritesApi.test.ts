import { describe, it, expect, beforeEach } from 'vitest'
import { favoritesApi, __resetFavoritesStoreForTest } from './favoritesApi'
import { FAVORITE_ERROR, type FavoriteStore } from '../types'

/** 테스트용 카드 팩토리 — 시드 배열의 순서가 곧 등록순(favoritedAt asc) */
const card = (id: string, over: Partial<FavoriteStore> = {}): FavoriteStore => ({
  id,
  name: `매장 ${id}`,
  imageUrl: null,
  distanceKm: 1,
  rating: 4,
  activeDealCount: 0,
  ...over,
})

describe('favoritesApi', () => {
  beforeEach(() => {
    __resetFavoritesStoreForTest([]) // 빈 상태에서 시작
  })

  it('추가_성공_및_목록_isFavorite_반영', async () => {
    await favoritesApi.add('s1', card('s1', { activeDealCount: 2 }))
    const list = await favoritesApi.list()
    expect(list.totalCount).toBe(1)
    expect(list.stores[0].id).toBe('s1')
    expect(favoritesApi.isFavorite('s1')).toBe(true)
  })

  it('중복_추가_idempotent_상한_미소진', async () => {
    await favoritesApi.add('s1', card('s1'))
    await favoritesApi.add('s1', card('s1'))
    expect((await favoritesApi.list()).totalCount).toBe(1)
  })

  it('해제_성공_및_없는것_해제도_안전', async () => {
    await favoritesApi.add('s1', card('s1'))
    await favoritesApi.remove('s1')
    await favoritesApi.remove('s1')
    expect(favoritesApi.isFavorite('s1')).toBe(false)
    expect((await favoritesApi.list()).totalCount).toBe(0)
  })

  it('상한_50_초과시_FAVORITE_LIMIT_REACHED_거부', async () => {
    __resetFavoritesStoreForTest(Array.from({ length: 50 }, (_, i) => card(`s${i}`)))
    await expect(favoritesApi.add('extra', card('extra'))).rejects.toMatchObject({
      code: FAVORITE_ERROR.LIMIT_REACHED,
    })
    // 이미 단골인 매장 재추가는 상한과 무관(idempotent)
    await expect(favoritesApi.add('s0', card('s0'))).resolves.toBeUndefined()
  })

  it('정렬_떨이활성_우선_후_등록순', async () => {
    // 등록순(=시드 인덱스): old-nodeal, old-deal, new-nodeal, new-deal
    __resetFavoritesStoreForTest([
      card('old-nodeal', { activeDealCount: 0 }),
      card('old-deal', { activeDealCount: 1 }),
      card('new-nodeal', { activeDealCount: 0 }),
      card('new-deal', { activeDealCount: 2 }),
    ])
    const list = await favoritesApi.list()
    // 활성 우선(등록순) → 비활성(등록순)
    expect(list.stores.map((s) => s.id)).toEqual([
      'old-deal',
      'new-deal',
      'old-nodeal',
      'new-nodeal',
    ])
  })

  it('통계_총개수와_활성떨이_합산', async () => {
    __resetFavoritesStoreForTest([
      card('a', { activeDealCount: 2 }),
      card('b', { activeDealCount: 3 }),
      card('c', { activeDealCount: 0 }),
    ])
    const list = await favoritesApi.list()
    expect(list.totalCount).toBe(3)
    expect(list.totalActiveDealCount).toBe(5)
  })
})
