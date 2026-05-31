import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { homeApi } from '../api/homeApi'
import { useFavoriteStores } from './useFavoriteStores'

vi.mock('../api/homeApi')

describe('useFavoriteStores', () => {
  it('단골_매장_목록_조회_성공', async () => {
    vi.mocked(homeApi.getFavoriteStores).mockResolvedValue([
      { id: 'fv-1', name: '단골 가게', imageUrl: null, distanceKm: 0.3, activeDealCount: 2 },
    ])

    const { result } = renderHook(() => useFavoriteStores(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].name).toBe('단골 가게')
  })
})
