import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { favoritesApi } from '../api/favoritesApi'
import { useFavorites } from './useFavorites'
import type { FavoriteList } from '../types'

vi.mock('../api/favoritesApi')

/** id 는 number — BE FavoriteStoreResponse.id (int64) */
const LIST: FavoriteList = {
  stores: [
    { id: 1, name: '브레드샵', imageUrl: null, distanceKm: 0.3, rating: 4.8, activeDealCount: 3 },
    { id: 2, name: '북카페 무드', imageUrl: null, distanceKm: 0.6, rating: 4.8, activeDealCount: 0 },
  ],
  totalCount: 2,
  totalActiveDealCount: 3,
}

describe('useFavorites', () => {
  beforeEach(() => vi.clearAllMocks())

  it('단골_목록_통계_조회_성공', async () => {
    vi.mocked(favoritesApi.list).mockResolvedValue(LIST)
    const { result } = renderHook(() => useFavorites(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.totalCount).toBe(2)
    expect(result.current.data?.stores[0].id).toBe(1)
  })
})
