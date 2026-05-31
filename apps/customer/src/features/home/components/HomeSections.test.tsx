import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { ClosingDealsSection } from './ClosingDealsSection'
import { FavoriteStoresSection } from './FavoriteStoresSection'
import { NeighborhoodSection } from './NeighborhoodSection'
import { useClosingDeals } from '../hooks/useClosingDeals'
import { useFavoriteStores } from '../hooks/useFavoriteStores'
import { useNeighborhoodStores } from '../hooks/useNeighborhoodStores'

vi.mock('../hooks/useClosingDeals')
vi.mock('../hooks/useFavoriteStores')
vi.mock('../hooks/useNeighborhoodStores')

function wrap(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <ComingSoonProvider>{ui}</ComingSoonProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('ClosingDealsSection', () => {
  it('결과_0건이면_빈안내_노출', () => {
    vi.mocked(useClosingDeals).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useClosingDeals>)

    wrap(<ClosingDealsSection />)
    expect(screen.getByText('지금 마감 임박한 떨이가 없어요.')).toBeInTheDocument()
  })

  it('떨이_있으면_카드_렌더', () => {
    vi.mocked(useClosingDeals).mockReturnValue({
      data: [
        {
          id: 'cd-1',
          storeName: '브레드샵',
          productName: '크루아상',
          imageUrl: null,
          discountRate: 50,
          originalPrice: 9000,
          salePrice: 4500,
          pickupDeadline: new Date(Date.now() + 600_000).toISOString(),
        },
      ],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useClosingDeals>)

    wrap(<ClosingDealsSection />)
    expect(screen.getByText('브레드샵')).toBeInTheDocument()
  })
})

describe('FavoriteStoresSection', () => {
  it('단골_0이면_등록_유도_안내', () => {
    vi.mocked(useFavoriteStores).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useFavoriteStores>)

    wrap(<FavoriteStoresSection />)
    expect(screen.getByText(/단골로 등록해 보세요/)).toBeInTheDocument()
  })
})

describe('NeighborhoodSection', () => {
  it('매장_목록_렌더', () => {
    vi.mocked(useNeighborhoodStores).mockReturnValue({
      data: [
        {
          id: 'nb-1',
          name: '북카페 무드',
          imageUrl: null,
          distanceKm: 0.8,
          rating: 4.6,
          activeDealCount: 2,
        },
      ],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useNeighborhoodStores>)

    wrap(<NeighborhoodSection />)
    expect(screen.getByText('북카페 무드')).toBeInTheDocument()
  })
})
