import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useMapStores } from './useMapStores'

describe('useMapStores', () => {
  it('params_null이면_fetch_안_함_idle', () => {
    const { result } = renderHook(() => useMapStores(null), { wrapper: createQueryWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('params_있으면_반경과_토글이_적용된_매장_반환', async () => {
    const { result } = renderHook(
      () => useMapStores({ latitude: 37.5571, longitude: 126.925, radiusKm: 3, dealsOnly: true }),
      { wrapper: createQueryWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data!.every((s) => s.activeDealCount > 0 && s.distanceKm <= 3)).toBe(true)
  })
})
