import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router'
import { searchApi } from '../api/searchApi'
import { readHistory, writeHistory } from '../lib/searchHistory'
import { SearchPage } from './SearchPage'

vi.mock('../api/searchApi')

function renderPage(initialEntry = '/search') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SearchPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(searchApi.search).mockResolvedValue({ stores: [], products: [] })
    vi.mocked(searchApi.autocomplete).mockResolvedValue([])
  })

  it('Enter로_검색하면_결과표시하고_기록저장', async () => {
    vi.mocked(searchApi.search).mockResolvedValue({
      stores: [
        {
          id: 101,
          name: '베이커리 브레드샵',
          imageUrl: null,
          distanceKm: 0.3,
          rating: 4.6,
          activeDealCount: 1,
          isFavorite: false,
        },
      ],
      products: [],
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('검색어 입력'), '브레드{Enter}')

    expect(await screen.findByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(readHistory(undefined)).toContain('브레드')
  })

  it('입력_중_자동완성_제안_탭하면_그_검색어로_결과', async () => {
    vi.mocked(searchApi.autocomplete).mockResolvedValue([{ kind: 'product', text: '크루아상' }])
    vi.mocked(searchApi.search).mockResolvedValue({
      stores: [],
      products: [
        {
          kind: 'deal',
          id: 1001,
          storeId: 101,
          storeName: '베이커리 브레드샵',
          name: '크루아상',
          imageUrl: null,
          originalPrice: 4000,
          salePrice: 2400,
          discountRate: 40,
        },
      ],
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('검색어 입력'), '크루')
    const suggestion = await screen.findByRole('button', { name: /크루아상/ })
    await user.click(suggestion)

    expect(await screen.findByText('크루아상')).toBeInTheDocument()
    expect(searchApi.search).toHaveBeenCalledWith({ q: '크루아상', sort: 'recommended' })
    expect(readHistory(undefined)).toContain('크루아상')
  })

  it('검색후_지우기_누르면_홈으로_복귀하고_최근검색_노출', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('검색어 입력'), '브레드{Enter}')
    await screen.findByText(/검색 결과가 없어요/)

    await user.click(screen.getByLabelText('입력 지우기'))

    expect(screen.getByText('최근 검색')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '브레드' })).toBeInTheDocument()
  })

  it('최근검색_칩_탭하면_재검색', async () => {
    writeHistory(undefined, ['라떼'])
    vi.mocked(searchApi.search).mockResolvedValue({
      stores: [],
      products: [
        {
          kind: 'deal',
          id: 1007,
          storeId: 102,
          storeName: '카페 모리',
          name: '라떼',
          imageUrl: null,
          originalPrice: 5000,
          salePrice: 3000,
          discountRate: 40,
        },
      ],
    })
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '라떼' }))

    expect(await screen.findByText('라떼')).toBeInTheDocument()
    expect(searchApi.search).toHaveBeenCalledWith({ q: '라떼', sort: 'recommended' })
  })

  it('URL_q로_진입하면_바로_결과화면', async () => {
    vi.mocked(searchApi.search).mockResolvedValue({
      stores: [
        {
          id: 101,
          name: '베이커리 브레드샵',
          imageUrl: null,
          distanceKm: 0.3,
          rating: 4.6,
          activeDealCount: 1,
          isFavorite: false,
        },
      ],
      products: [],
    })
    renderPage('/search?q=브레드')

    expect(await screen.findByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(searchApi.search).toHaveBeenCalledWith({ q: '브레드', sort: 'recommended' })
  })
})
