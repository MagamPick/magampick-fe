import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FavoriteListCard } from './FavoriteListCard'
import type { FavoriteStore } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => mockNavigate.mockClear())

/** id 는 number — BE FavoriteStoreResponse.id (int64) */
const STORE: FavoriteStore = {
  id: 10,
  name: '북카페 무드',
  imageUrl: null,
  distanceKm: 0.6,
  rating: 4.8,
  activeDealCount: 2,
}

describe('FavoriteListCard', () => {
  it('사진_명_거리별점_진행중할인수_렌더', () => {
    render(<FavoriteListCard store={STORE} />)
    expect(screen.getByText('북카페 무드')).toBeInTheDocument()
    expect(screen.getByText('0.6km · ★ 4.8')).toBeInTheDocument()
    expect(screen.getByText('진행 중 마감 할인 2건')).toBeInTheDocument()
  })

  it('진행중_할인_0건이면_없음_안내', () => {
    render(<FavoriteListCard store={{ ...STORE, activeDealCount: 0 }} />)
    expect(screen.getByText('오늘 진행 중 마감 할인 없음')).toBeInTheDocument()
  })

  it('카드_탭시_매장상세_String_id_이동', async () => {
    const user = userEvent.setup()
    render(<FavoriteListCard store={STORE} />)
    await user.click(screen.getByRole('button'))
    // ROUTES.STORE_DETAIL(String(store.id)) → '/store/10'
    expect(mockNavigate).toHaveBeenCalledWith('/store/10')
  })
})
