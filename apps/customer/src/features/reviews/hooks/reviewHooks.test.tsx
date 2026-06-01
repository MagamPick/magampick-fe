import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reviewKeys } from './reviewKeys'
import { useMyReviews } from './useMyReviews'
import { useReviewableOrders } from './useReviewableOrders'
import { useCreateReview } from './useCreateReview'
import { useUpdateReview } from './useUpdateReview'
import { useDeleteReview } from './useDeleteReview'
import { resetReviewsForTest } from '../api/reviewsApi'

function setup() {
  const qc = new QueryClient({
    // gcTime 0 + unmount(cleanup) → 쿼리 캐시 gc 타이머가 안 남아 vitest 워커가 깔끔히 종료
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(qc, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { invalidate, wrapper }
}

describe('reviews hooks', () => {
  beforeEach(() => resetReviewsForTest())
  afterEach(() => cleanup())

  it('useMyReviews — 내 리뷰 목록을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useMyReviews(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
  })

  it('useReviewableOrders — 완료주문 목록을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useReviewableOrders(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
  })

  it('useCreateReview — 성공 시 reviews 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useCreateReview(), { wrapper })
    result.current.mutate({ orderId: 'od-1', rating: 5, content: '좋아요', tags: [], photos: [] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })

  it('useUpdateReview — 성공 시 reviews 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateReview('rv-2'), { wrapper })
    result.current.mutate({ rating: 3, content: '수정', tags: [], photos: [] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })

  it('useDeleteReview — 성공 시 reviews 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useDeleteReview(), { wrapper })
    result.current.mutate('rv-2') // 답글 없는 리뷰
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })
})
