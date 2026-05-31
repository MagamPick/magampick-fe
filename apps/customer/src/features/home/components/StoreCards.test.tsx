import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from './ComingSoonToast'
import { FavoriteStoreCard } from './FavoriteStoreCard'
import { StoreRow } from './StoreRow'

function wrap(ui: ReactNode) {
  return render(<ComingSoonProvider>{ui}</ComingSoonProvider>)
}

describe('FavoriteStoreCard', () => {
  it('이름_거리_진행중할인수_표시_그리고_탭시_매장상세_준비중', async () => {
    const user = userEvent.setup()
    wrap(
      <FavoriteStoreCard
        store={{ id: 'fv', name: '단골집', imageUrl: null, distanceKm: 0.3, activeDealCount: 2 }}
      />,
    )

    expect(screen.getByText('단골집')).toBeInTheDocument()
    expect(screen.getByText('0.3km')).toBeInTheDocument()
    expect(screen.getByText('진행 중 마감 할인 2건')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(await screen.findByText('매장 상세는 준비 중이에요.')).toBeInTheDocument()
  })

  it('진행중_할인_0건이면_배지_생략', () => {
    wrap(
      <FavoriteStoreCard
        store={{ id: 'fv', name: '단골집', imageUrl: null, distanceKm: 0.3, activeDealCount: 0 }}
      />,
    )
    expect(screen.queryByText(/진행 중 마감 할인/)).not.toBeInTheDocument()
  })
})

describe('StoreRow', () => {
  it('이름_거리평점_표시_0건이면_배지생략', () => {
    wrap(
      <StoreRow
        store={{
          id: 'nb',
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
  })
})
