import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { storeDetailApi } from '../api/storeDetailApi'
import { useStoreDetail } from './useStoreDetail'
import type { StoreDetail } from '../types'

vi.mock('../api/storeDetailApi')

const STORE: StoreDetail = {
  id: 1,
  name: '브레드샵',
  imageUrl: null,
  businessStatus: 'OPEN',
  closingTime: '21:00',
  rating: 4.8,
  reviewCount: 412,
  distanceKm: 0.3,
  isFavorite: false,
  address: '서울 마포구',
  phone: '02-1234-5678',
  businessNumber: '123-45-67890',
  operatingHours: [],
  lat: 37.55,
  lng: 126.92,
}

describe('useStoreDetail', () => {
  it('매장상세_조회_성공', async () => {
    vi.mocked(storeDetailApi.getStoreDetail).mockResolvedValue(STORE)

    const { result } = renderHook(() => useStoreDetail(1), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('브레드샵')
    expect(result.current.data?.businessStatus).toBe('OPEN')
    expect(storeDetailApi.getStoreDetail).toHaveBeenCalledWith(1)
  })
})
