import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HomeShortcuts } from './HomeShortcuts'
import { useReviewSummary } from '@/features/reviews/hooks/useReviewSummary'

vi.mock('@/features/reviews/hooks/useReviewSummary')

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useReviewSummary).mockReturnValue({
    data: { average: 4.6, total: 128, replyRate: 0 },
  } as unknown as ReturnType<typeof useReviewSummary>)
})

describe('HomeShortcuts', () => {
  it('리뷰관리_행에_요약_평점과_리뷰수를_표시', () => {
    render(
      <MemoryRouter>
        <HomeShortcuts />
      </MemoryRouter>,
    )

    expect(screen.getByText('★ 4.6 · 128')).toBeInTheDocument()
  })
})
