import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoreListCard } from './StoreListCard'
import type { StoreListItem } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router', async (orig) => ({
  ...(await orig<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}))

const base: StoreListItem = {
  id: 1,
  name: '브레드샵',
  imageUrl: null,
  distanceKm: 0.3,
  rating: 4.6,
  activeDealCount: 2,
  isFavorite: false,
}

beforeEach(() => mockNavigate.mockClear())

describe('StoreListCard', () => {
  it('이름_거리평점_표시_그리고_탭시_매장상세_이동', async () => {
    const user = userEvent.setup()
    render(<StoreListCard store={base} />)

    expect(screen.getByText('브레드샵')).toBeInTheDocument()
    expect(screen.getByText('0.3km · ★ 4.6')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/store/1')
  })

  it('진행중_할인_있으면_표시_0건이면_생략', () => {
    const { rerender } = render(<StoreListCard store={{ ...base, activeDealCount: 2 }} />)
    expect(screen.getByText('진행 중 마감 할인 2건')).toBeInTheDocument()

    rerender(<StoreListCard store={{ ...base, activeDealCount: 0 }} />)
    expect(screen.queryByText(/진행 중 마감 할인/)).not.toBeInTheDocument()
  })

  it('리뷰_0개면_별점_생략_거리만', () => {
    render(<StoreListCard store={{ ...base, rating: 0 }} />)
    expect(screen.getByText('0.3km')).toBeInTheDocument()
    expect(screen.queryByText(/★/)).not.toBeInTheDocument()
  })

  it('단골이면_단골뱃지_표시_아니면_없음', () => {
    const { rerender } = render(<StoreListCard store={{ ...base, isFavorite: true }} />)
    expect(screen.getByText('단골')).toBeInTheDocument()

    rerender(<StoreListCard store={{ ...base, isFavorite: false }} />)
    expect(screen.queryByText('단골')).not.toBeInTheDocument()
  })
})
