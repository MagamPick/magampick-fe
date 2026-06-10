import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { storeListApi } from '../api/storeListApi'
import { useStoreList } from './useStoreList'
import type { StoreListItem } from '../types'

vi.mock('../api/storeListApi')

const item = (id: number): StoreListItem => ({
  id,
  name: String(id),
  imageUrl: null,
  distanceKm: 0.5,
  rating: 4.5,
  activeDealCount: 1,
  isFavorite: false,
})

describe('useStoreList', () => {
  it('첫_페이지_total_노출_그리고_hasNext_true이면_다음페이지_있음', async () => {
    vi.mocked(storeListApi.getStores).mockResolvedValue({
      items: [item(1), item(2)],
      page: 0,
      size: 20,
      hasNext: true,
      total: 4,
      dealStoreCount: 2,
    })

    const { result } = renderHook(() => useStoreList('distance'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.pages[0].items).toHaveLength(2)
    expect(result.current.data!.pages[0].total).toBe(4)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('hasNext_false이면_마지막페이지_더보기없음', async () => {
    vi.mocked(storeListApi.getStores).mockResolvedValue({
      items: [item(1)],
      page: 0,
      size: 20,
      hasNext: false,
      total: 1,
      dealStoreCount: 1,
    })

    const { result } = renderHook(() => useStoreList('distance'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(false)
  })

  it('정렬_파라미터가_첫페이지_요청에_전달', async () => {
    vi.mocked(storeListApi.getStores).mockResolvedValue({
      items: [],
      page: 0,
      size: 20,
      hasNext: false,
      total: 0,
      dealStoreCount: 0,
    })

    const { result } = renderHook(() => useStoreList('rating'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(storeListApi.getStores).toHaveBeenCalledWith({ sort: 'rating', page: 0 })
  })
})
