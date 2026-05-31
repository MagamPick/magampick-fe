import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from '@/shared/lib/apiError'
import { favoritesApi } from '../api/favoritesApi'
import { favoriteKeys } from './favoriteKeys'
import { useToggleFavorite } from './useToggleFavorite'
import { FAVORITE_ERROR, type FavoriteList, type FavoriteStore } from '../types'

vi.mock('../api/favoritesApi')

const store = (id: string, over: Partial<FavoriteStore> = {}): FavoriteStore => ({
  id,
  name: `매장 ${id}`,
  imageUrl: null,
  distanceKm: 1,
  rating: 4,
  activeDealCount: 0,
  ...over,
})

function setup(initialList?: FavoriteList) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  if (initialList) queryClient.setQueryData(favoriteKeys.list(), initialList)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useToggleFavorite(), { wrapper })
  return { queryClient, result }
}

describe('useToggleFavorite', () => {
  beforeEach(() => vi.clearAllMocks())

  it('해제_시_목록에서_즉시_제거되고_통계_보정', async () => {
    vi.mocked(favoritesApi.remove).mockResolvedValue()
    const { queryClient, result } = setup({
      stores: [store('s1', { activeDealCount: 2 }), store('s2', { activeDealCount: 1 })],
      totalCount: 2,
      totalActiveDealCount: 3,
    })

    act(() => result.current.mutate({ storeId: 's1', next: false }))

    await waitFor(() => {
      const list = queryClient.getQueryData<FavoriteList>(favoriteKeys.list())
      expect(list?.stores.map((s) => s.id)).toEqual(['s2'])
    })
    const after = queryClient.getQueryData<FavoriteList>(favoriteKeys.list())
    expect(after?.totalCount).toBe(1)
    expect(after?.totalActiveDealCount).toBe(1)
  })

  it('추가_시_store_제공하면_목록에_즉시_삽입', async () => {
    vi.mocked(favoritesApi.add).mockResolvedValue()
    const { queryClient, result } = setup({ stores: [], totalCount: 0, totalActiveDealCount: 0 })

    act(() =>
      result.current.mutate({ storeId: 's9', next: true, store: store('s9', { activeDealCount: 2 }) }),
    )

    await waitFor(() => {
      const list = queryClient.getQueryData<FavoriteList>(favoriteKeys.list())
      expect(list?.stores.some((s) => s.id === 's9')).toBe(true)
    })
    expect(queryClient.getQueryData<FavoriteList>(favoriteKeys.list())?.totalActiveDealCount).toBe(2)
  })

  it('매장상세_캐시_isFavorite_즉시_패치', async () => {
    vi.mocked(favoritesApi.add).mockResolvedValue()
    const { queryClient, result } = setup()
    queryClient.setQueryData(['store', 's1'], { id: 's1', isFavorite: false })

    act(() => result.current.mutate({ storeId: 's1', next: true, store: store('s1') }))

    await waitFor(() =>
      expect(
        queryClient.getQueryData<{ isFavorite: boolean }>(['store', 's1'])?.isFavorite,
      ).toBe(true),
    )
  })

  it('추가_실패시_목록_롤백', async () => {
    vi.mocked(favoritesApi.add).mockRejectedValue(
      new ApiError(409, FAVORITE_ERROR.LIMIT_REACHED, '상한'),
    )
    const { queryClient, result } = setup({
      stores: [store('s1')],
      totalCount: 1,
      totalActiveDealCount: 0,
    })

    act(() =>
      result.current.mutate({ storeId: 's9', next: true, store: store('s9', { activeDealCount: 5 }) }),
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    const after = queryClient.getQueryData<FavoriteList>(favoriteKeys.list())
    expect(after?.stores.map((s) => s.id)).toEqual(['s1'])
    expect(after?.totalCount).toBe(1)
  })
})
