import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { SearchResults } from './SearchResults'
import type { SearchResult } from '../types'
import type { StoreListItem } from '@/features/store-list/types'

const store: StoreListItem = {
  id: 'st-1',
  name: '베이커리 브레드샵',
  imageUrl: null,
  distanceKm: 0.3,
  rating: 4.6,
  activeDealCount: 2,
  isFavorite: false,
}

const result: SearchResult = {
  stores: [store],
  products: [
    {
      kind: 'deal',
      id: 'p-9',
      storeId: 'st-7',
      storeName: '베이글 브라더스',
      name: '플레인 베이글',
      imageUrl: null,
      originalPrice: 4000,
      salePrice: 2600,
      discountRate: 35,
    },
  ],
}

function renderResults(r: SearchResult, onSortChange = () => {}) {
  return render(
    <MemoryRouter>
      <SearchResults result={r} sort="recommended" onSortChange={onSortChange} />
    </MemoryRouter>,
  )
}

describe('SearchResults', () => {
  it('매장·상품_섹션_각각_표시', () => {
    renderResults(result)
    expect(screen.getByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(screen.getByText('플레인 베이글')).toBeInTheDocument()
    expect(screen.getByText(/매장/)).toBeInTheDocument()
    expect(screen.getByText(/상품/)).toBeInTheDocument()
  })

  it('매장_섹션이_상품_섹션보다_먼저', () => {
    renderResults(result)
    const storeHeader = screen.getByText(/매장/)
    const productHeader = screen.getByText(/상품/)
    expect(
      storeHeader.compareDocumentPosition(productHeader) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('둘다_0건이면_검색결과없음_정렬칩도_없음', () => {
    renderResults({ stores: [], products: [] })
    expect(screen.getByText(/검색 결과가 없어요/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '추천순' })).toBeNull()
  })

  it('정렬칩_변경시_onSortChange', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    renderResults(result, onSortChange)
    await user.click(screen.getByRole('button', { name: '거리순' }))
    expect(onSortChange).toHaveBeenCalledWith('distance')
  })
})
