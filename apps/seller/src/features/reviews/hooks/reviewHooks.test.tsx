import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reviewKeys } from './reviewKeys'
import { useStoreReviews } from './useStoreReviews'
import { useReviewSummary } from './useReviewSummary'
import { useReplyToReview } from './useReplyToReview'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'

/** BE StoreReviewResponse 픽스처 */
const beReview = {
  id: 1,
  authorNickname: '빵순이님',
  rating: 5,
  content: '맛있어요',
  createdAt: '2026-05-20T11:00:00+09:00',
  products: [{ productId: 1, kind: 'MENU', name: '크루아상' }],
  photos: [],
  tags: ['신선해요'],
  ownerReply: null,
}

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(qc, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, invalidate, wrapper }
}

describe('reviews hooks (seller)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  it('useStoreReviews — 매장 리뷰 목록을 불러온다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [beReview] })
    const { wrapper } = setup()
    const { result } = renderHook(() => useStoreReviews('1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('1')
  })

  it('useReviewSummary — 요약(총개수·평균·답글률)을 list에서 파생한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [beReview] })
    const { wrapper } = setup()
    const { result } = renderHook(() => useReviewSummary('1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.total).toBe(1)
    expect(result.current.data!.average).toBe(5)
    expect(result.current.data!.replyRate).toBe(0) // ownerReply: null
  })

  it('useReplyToReview — 성공 시 reviews 무효화', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { ...beReview, ownerReply: '감사합니다!' },
    })
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useReplyToReview(), { wrapper })
    result.current.mutate({ reviewId: '1', content: '감사합니다!' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })
})
