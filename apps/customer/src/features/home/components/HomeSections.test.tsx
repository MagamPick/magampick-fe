import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { ClosingDealsSection } from './ClosingDealsSection'
import { FavoriteStoresSection } from './FavoriteStoresSection'
import { NeighborhoodSection } from './NeighborhoodSection'
import { useClosingDeals } from '../hooks/useClosingDeals'
import { useNeighborhoodStores } from '../hooks/useNeighborhoodStores'

vi.mock('../hooks/useClosingDeals')
vi.mock('../hooks/useNeighborhoodStores')
vi.mock('@/features/favorites/hooks/useFavorites')

const mockNavigate = vi.fn()
vi.mock('react-router', async (orig) => ({
  ...(await orig<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}))

function wrap(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <ComingSoonProvider>{ui}</ComingSoonProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // 내 단골 프리뷰는 단골 단일 소스(useFavorites)를 읽음 — 기본 빈 목록
  vi.mocked(useFavorites).mockReturnValue({
    data: { stores: [], totalCount: 0, totalActiveDealCount: 0 },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useFavorites>)
})

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
          id: 1,
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
    wrap(<FavoriteStoresSection />)
    expect(screen.getByText(/단골로 등록해 보세요/)).toBeInTheDocument()
  })

  it('단골_있으면_프리뷰_카드_렌더', () => {
    vi.mocked(useFavorites).mockReturnValue({
      data: {
        stores: [
          {
            // id 는 number — BE FavoriteStoreResponse.id (int64)
            id: 1,
            name: '단골집',
            imageUrl: null,
            distanceKm: 0.3,
            rating: 4.8,
            activeDealCount: 2,
          },
        ],
        totalCount: 1,
        totalActiveDealCount: 2,
      },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useFavorites>)

    wrap(<FavoriteStoresSection />)
    expect(screen.getByText('단골집')).toBeInTheDocument()
  })
})

describe('NeighborhoodSection', () => {
  it('매장_목록_렌더', () => {
    vi.mocked(useNeighborhoodStores).mockReturnValue({
      data: [
        {
          id: 1,
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

describe('홈 더보기 → 전체 매장 정렬 연동', () => {
  it('마감임박_더보기는_전체매장_마감임박순으로_이동', async () => {
    vi.mocked(useClosingDeals).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useClosingDeals>)

    wrap(<ClosingDealsSection />)
    await userEvent.click(screen.getByRole('button', { name: '더보기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/all?sort=closing')
  })

  it('동네마감픽_더보기는_전체매장_추천순으로_이동', async () => {
    vi.mocked(useNeighborhoodStores).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useNeighborhoodStores>)

    wrap(<NeighborhoodSection />)
    await userEvent.click(screen.getByRole('button', { name: '더보기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/all?sort=recommended')
  })
})
