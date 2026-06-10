import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useMapStores } from './useMapStores'

// mapApi 전체 mock — 실 BE 호출 없이 훅 동작 검증
vi.mock('../api/mapApi', () => ({
  mapApi: {
    getMapStores: vi.fn(),
  },
}))

import { mapApi } from '../api/mapApi'

const mapStoreMock = {
  id: 1,
  name: '베이커리 브레드샵',
  imageUrl: null,
  latitude: 37.556,
  longitude: 126.926,
  distanceKm: 0.3,
  rating: 4.6,
  activeDealCount: 2,
  maxDiscountRate: 40,
}

describe('useMapStores', () => {
  beforeEach(() => vi.clearAllMocks())

  it('params_null이면_fetch_안_함_idle', () => {
    const { result } = renderHook(() => useMapStores(null), { wrapper: createQueryWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('params_있으면_mapApi.getMapStores_호출_후_데이터_반환', async () => {
    vi.mocked(mapApi.getMapStores).mockResolvedValue([mapStoreMock])
    const params = { latitude: 37.5571, longitude: 126.925, radiusKm: 3 as const, dealsOnly: true }
    const { result } = renderHook(() => useMapStores(params), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mapApi.getMapStores).toHaveBeenCalledWith(params)
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe(1)
    expect(typeof result.current.data![0].id).toBe('number')
  })

  it('빈_배열_응답도_정상_처리', async () => {
    vi.mocked(mapApi.getMapStores).mockResolvedValue([])
    const { result } = renderHook(
      () => useMapStores({ latitude: 37.5571, longitude: 126.925, radiusKm: 1, dealsOnly: true }),
      { wrapper: createQueryWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })
})
