import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reviewKeys } from './reviewKeys'
import { useStoreReviews } from './useStoreReviews'
import { useReviewSummary } from './useReviewSummary'
import { useReplyToReview } from './useReplyToReview'
import { resetReviewsForTest, reviewsApi } from '../api/reviewsApi'

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(qc, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { invalidate, wrapper }
}

describe('reviews hooks (seller)', () => {
  beforeEach(() => resetReviewsForTest())
  afterEach(() => cleanup())

  it('useStoreReviews — 매장 리뷰 목록을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useStoreReviews('s1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
  })

  it('useReviewSummary — 요약(총개수)을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useReviewSummary('s1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.total).toBeGreaterThan(0)
  })

  it('useReplyToReview — 성공 시 reviews 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const target = (await reviewsApi.listStoreReviews()).find((r) => r.ownerReply === null)
    if (!target) throw new Error('seed 에 답글 없는 리뷰가 없음')

    const { result } = renderHook(() => useReplyToReview(), { wrapper })
    result.current.mutate({ reviewId: target.id, content: '감사합니다!' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })
})
