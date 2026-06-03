import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { homeApi } from '../api/homeApi'
import { useNeighborhoodStores } from './useNeighborhoodStores'

vi.mock('../api/homeApi')

describe('useNeighborhoodStores', () => {
  it('동네_마감픽_상위목록_조회_성공', async () => {
    vi.mocked(homeApi.getNeighborhoodStores).mockResolvedValue([
      {
        id: 'nb-1',
        name: '북카페 무드',
        imageUrl: null,
        distanceKm: 0.6,
        rating: 4.8,
        activeDealCount: 2,
      },
    ])

    const { result } = renderHook(() => useNeighborhoodStores(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].name).toBe('북카페 무드')
  })
})
