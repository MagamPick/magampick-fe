import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FavoriteStoreCard } from './FavoriteStoreCard'
import { StoreRow } from './StoreRow'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => mockNavigate.mockClear())

describe('FavoriteStoreCard', () => {
  it('이름_거리_진행중할인수_표시_그리고_탭시_매장상세_String_id_이동', async () => {
    const user = userEvent.setup()
    render(
      <FavoriteStoreCard
        // id 는 number — BE FavoriteStoreResponse.id (int64)
        store={{ id: 5, name: '단골집', imageUrl: null, distanceKm: 0.3, rating: 4.5, activeDealCount: 2 }}
      />,
    )

    expect(screen.getByText('단골집')).toBeInTheDocument()
    expect(screen.getByText('0.3km')).toBeInTheDocument()
    expect(screen.getByText('진행 중 마감 할인 2건')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    // ROUTES.STORE_DETAIL(String(store.id)) → '/store/5'
    expect(mockNavigate).toHaveBeenCalledWith('/store/5')
  })

  it('진행중_할인_0건이면_배지_생략', () => {
    render(
      <FavoriteStoreCard
        store={{ id: 5, name: '단골집', imageUrl: null, distanceKm: 0.3, rating: 4.5, activeDealCount: 0 }}
      />,
    )
    expect(screen.queryByText(/진행 중 마감 할인/)).not.toBeInTheDocument()
  })
})

describe('StoreRow', () => {
  it('이름_거리평점_표시_0건이면_배지생략_그리고_탭시_매장상세_이동', async () => {
    const user = userEvent.setup()
    render(
      <StoreRow
        store={{
          id: 3,
          name: '동네집',
          imageUrl: null,
          distanceKm: 0.8,
          rating: 4.6,
          activeDealCount: 0,
        }}
      />,
    )

    expect(screen.getByText('동네집')).toBeInTheDocument()
    expect(screen.getByText('0.8km · ★ 4.6')).toBeInTheDocument()
    expect(screen.queryByText(/진행 중 마감 할인/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/store/3')
  })
})
