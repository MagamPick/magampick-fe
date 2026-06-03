import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ReviewTab } from './ReviewTab'
import { useReviewSummary } from '../hooks/useReviewSummary'
import { useStoreReviews } from '../hooks/useStoreReviews'
import type { ReviewSummary, StoreReview } from '../types'

vi.mock('../hooks/useReviewSummary')
vi.mock('../hooks/useStoreReviews')

const summary: ReviewSummary = {
  average: 4.8,
  count: 412,
  distribution: [
    { star: 5, count: 338 },
    { star: 4, count: 49 },
    { star: 3, count: 16 },
    { star: 2, count: 5 },
    { star: 1, count: 4 },
  ],
}

const review: StoreReview = {
  id: 'rv-1',
  authorNickname: '빵순이',
  rating: 5,
  content: '빵도 신선하고 좋았어요.',
  createdAt: new Date('2026-05-20').toISOString(),
  products: [{ productId: 'sd-1', kind: 'deal', name: '크루아상 세트' }],
  photos: [],
  tags: ['#신선해요'],
  ownerReply: '감사해요. 또 들러주세요!',
}

function mockSummary(value: ReviewSummary) {
  vi.mocked(useReviewSummary).mockReturnValue({
    data: value,
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useReviewSummary>)
}

function mockReviews(items: StoreReview[]) {
  vi.mocked(useStoreReviews).mockReturnValue({
    data: { pages: [{ items, nextCursor: null }] },
    isPending: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  } as unknown as ReturnType<typeof useStoreReviews>)
}

describe('ReviewTab', () => {
  it('요약_평점_분포_그리고_리뷰카드_사장답글_노출', () => {
    mockSummary(summary)
    mockReviews([review])
    render(
      <MemoryRouter>
        <ReviewTab storeId="st-1" />
      </MemoryRouter>,
    )

    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('리뷰 412개')).toBeInTheDocument()
    expect(screen.getByText('빵도 신선하고 좋았어요.')).toBeInTheDocument()
    expect(screen.getByText('사장님 답글')).toBeInTheDocument()
  })

  it('리뷰_0건이면_요약은_나오고_빈안내', () => {
    mockSummary({ average: 0, count: 0, distribution: summary.distribution })
    mockReviews([])
    render(
      <MemoryRouter>
        <ReviewTab storeId="st-1" />
      </MemoryRouter>,
    )

    expect(screen.getByText('리뷰 0개')).toBeInTheDocument()
    expect(screen.getByText('아직 등록된 리뷰가 없어요.')).toBeInTheDocument()
  })
})
