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
import { reviewsApi } from '../api/reviewsApi'

vi.mock('../api/reviewsApi')

const mockReview = {
  id: '1',
  storeId: '10',
  storeName: '브레드샵',
  items: [{ productId: '100', kind: 'deal' as const, name: '크루아상' }],
  rating: 5,
  content: '맛있어요',
  tags: ['맛있어요'],
  photos: [],
  createdAt: '2026-06-10T10:00:00Z',
  ownerReply: null,
}

const mockOrder = {
  orderId: '42',
  storeId: '10',
  storeName: '브레드샵',
  items: [{ productId: '100', kind: 'menu' as const, name: '크루아상' }],
  pickedUpAt: '2026-06-10T09:00:00Z',
  reviewed: false,
  reviewId: null,
}

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
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  it('useMyReviews — 내 리뷰 목록을 불러온다', async () => {
    vi.mocked(reviewsApi.listMyReviews).mockResolvedValue([mockReview])
    const { wrapper } = setup()
    const { result } = renderHook(() => useMyReviews(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
  })

  it('useReviewableOrders — 완료주문 목록을 불러온다', async () => {
    vi.mocked(reviewsApi.listReviewableOrders).mockResolvedValue([mockOrder])
    const { wrapper } = setup()
    const { result } = renderHook(() => useReviewableOrders(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
  })

  it('useCreateReview — 성공 시 reviews 무효화', async () => {
    vi.mocked(reviewsApi.createReview).mockResolvedValue(mockReview)
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useCreateReview(), { wrapper })
    result.current.mutate({ orderId: 'od-1', rating: 5, content: '좋아요', tags: [], photos: [] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })

  it('useUpdateReview — 성공 시 reviews 무효화', async () => {
    vi.mocked(reviewsApi.updateReview).mockResolvedValue(mockReview)
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateReview('1'), { wrapper })
    result.current.mutate({ rating: 3, content: '수정', tags: [], photos: [] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })

  it('useDeleteReview — 성공 시 reviews 무효화', async () => {
    vi.mocked(reviewsApi.deleteReview).mockResolvedValue(undefined)
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useDeleteReview(), { wrapper })
    result.current.mutate('1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewKeys.all })
  })
})
