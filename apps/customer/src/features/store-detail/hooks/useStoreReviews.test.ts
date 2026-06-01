import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { storeDetailApi } from '../api/storeDetailApi'
import { useStoreReviews } from './useStoreReviews'
import type { StoreReview } from '../types'

vi.mock('../api/storeDetailApi')

const review = (id: string): StoreReview => ({
  id,
  authorNickname: '빵순이',
  rating: 5,
  content: '좋아요',
  createdAt: new Date().toISOString(),
  products: [],
  photos: [],
  tags: [],
  ownerReply: null,
})

describe('useStoreReviews', () => {
  it('무한스크롤_다음페이지_누적_그리고_마지막', async () => {
    vi.mocked(storeDetailApi.getStoreReviews).mockImplementation(async (_id, opts) => {
      const cursor = opts?.cursor ?? 0
      return cursor === 0
        ? { items: [review('rv-1'), review('rv-2')], nextCursor: 1 }
        : { items: [review('rv-3')], nextCursor: null }
    })

    const { result } = renderHook(() => useStoreReviews('st-1'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0].items).toHaveLength(2)
    expect(result.current.hasNextPage).toBe(true)

    await result.current.fetchNextPage()

    await waitFor(() => expect(result.current.hasNextPage).toBe(false))
    const all = result.current.data?.pages.flatMap((p) => p.items) ?? []
    expect(all).toHaveLength(3)
  })
})
