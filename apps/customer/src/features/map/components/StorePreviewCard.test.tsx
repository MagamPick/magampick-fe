import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StorePreviewCard } from './StorePreviewCard'
import type { MapStore } from '../types'

const store = (over: Partial<MapStore> = {}): MapStore => ({
  id: 'st-1',
  name: '베이커리 브레드샵',
  imageUrl: null,
  latitude: 37.55,
  longitude: 126.92,
  distanceKm: 0.3,
  rating: 4.6,
  activeDealCount: 2,
  maxDiscountRate: 40,
  ...over,
})

describe('StorePreviewCard', () => {
  it('매장명_거리_평점_진행중_마감할인_노출', () => {
    render(<StorePreviewCard store={store()} onClick={() => {}} />)
    expect(screen.getByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(screen.getByText('0.3km · ★ 4.6')).toBeInTheDocument()
    expect(screen.getByText('진행 중 마감 할인 2건')).toBeInTheDocument()
  })

  it('활성딜_0이면_할인줄_숨김_평점0이면_별점_숨김', () => {
    render(<StorePreviewCard store={store({ activeDealCount: 0, rating: 0 })} onClick={() => {}} />)
    expect(screen.queryByText(/진행 중 마감 할인/)).not.toBeInTheDocument()
    expect(screen.getByText('0.3km')).toBeInTheDocument()
    expect(screen.queryByText(/★/)).not.toBeInTheDocument()
  })

  it('카드_클릭_시_onClick_호출', async () => {
    const onClick = vi.fn()
    render(<StorePreviewCard store={store()} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
