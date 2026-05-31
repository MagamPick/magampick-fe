import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'
import { useToggleFavorite } from './useToggleFavorite'
import type { StoreDetail } from '../types'

vi.mock('../api/storeDetailApi')

const STORE: StoreDetail = {
  id: 'st-1',
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

describe('useToggleFavorite', () => {
  it('낙관적_업데이트로_isFavorite_즉시_반영', async () => {
    vi.mocked(storeDetailApi.toggleFavorite).mockResolvedValue({ isFavorite: true })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    queryClient.setQueryData(['store', 'st-1'], STORE)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useToggleFavorite('st-1'), { wrapper })

    act(() => {
      result.current.mutate(true)
    })

    await waitFor(() =>
      expect(queryClient.getQueryData<StoreDetail>(['store', 'st-1'])?.isFavorite).toBe(true),
    )
  })
})
