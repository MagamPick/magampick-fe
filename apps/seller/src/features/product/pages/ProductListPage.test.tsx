import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../hooks/useProducts')
vi.mock('@/features/clearance/hooks/useClearances')
import { useProducts } from '../hooks/useProducts'
import { useClearances } from '@/features/clearance/hooks/useClearances'
import { ProductListPage } from './ProductListPage'
import type { Product } from '../types'
import type { ClearanceView } from '@/features/clearance/types'

function mockProducts(data: Product[] | undefined, isLoading = false) {
  vi.mocked(useProducts).mockReturnValue({ data, isLoading } as unknown as ReturnType<
    typeof useProducts
  >)
}
function mockClearances(data: ClearanceView[] = [], isLoading = false) {
  vi.mocked(useClearances).mockReturnValue({ data, isLoading } as unknown as ReturnType<
    typeof useClearances
  >)
}

function renderPage(initial = '/products') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ProductListPage />
    </MemoryRouter>,
  )
}

const product: Product = {
  id: 'p1',
  storeId: 's1',
  name: '통밀 식빵',
  category: '베이커리',
  price: 4800,
  onSale: true,
}

const liveClearance: ClearanceView = {
  id: 'c1',
  storeId: 's1',
  productId: 'p1',
  salePrice: 2400,
  totalQty: 20,
  soldQty: 8,
  closeTime: '21:00',
  status: 'ACTIVE',
  createdAt: '2026-06-01T08:00:00.000Z',
  productName: '통밀 식빵',
  originalPrice: 4800,
  remainingQty: 12,
}

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClearances([])
  })

  it('상품 등록하기 CTA 가 등록 화면으로 연결된다', () => {
    mockProducts([])
    renderPage()
    expect(screen.getByRole('link', { name: /상품 등록하기/ })).toHaveAttribute(
      'href',
      '/products/new',
    )
  })

  // page-background-token-trap: 사장 화면 셸은 흰색(bg-card) — 회색(bg-background) 금지
  it('화면 셸 배경은 흰색(bg-card)을 유지한다', () => {
    mockProducts([])
    const { container } = renderPage()
    expect(container.firstElementChild).toHaveClass('bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })

  it('상품이 하나도 없으면 빈 상태 안내를 보여준다', () => {
    mockProducts([])
    renderPage()
    expect(screen.getByText(/첫 상품을 등록/)).toBeInTheDocument()
  })

  it('일반 상품을 카드로 보여주고 판매 상태 배지를 표시한다', () => {
    mockProducts([
      product,
      { id: 'p2', storeId: 's1', name: '카페라떼', category: '음료', price: 4000, onSale: false },
    ])
    renderPage()
    expect(screen.getByText('통밀 식빵')).toBeInTheDocument()
    expect(screen.getByText('카페라떼')).toBeInTheDocument()
    expect(screen.getByText('판매중지')).toBeInTheDocument()
  })

  it('진행 중인 떨이가 있는 상품 카드에 마감 할인 배지를 표시한다', () => {
    mockProducts([product])
    mockClearances([liveClearance])
    renderPage()
    expect(screen.getByText(/마감 할인 진행중/)).toBeInTheDocument()
  })

  it('상품 카드를 누르면 상품 상세로 연결된다', () => {
    mockProducts([product])
    renderPage()
    expect(screen.getByRole('link', { name: /통밀 식빵/ })).toHaveAttribute('href', '/products/p1')
  })

  it('마감 할인 탭으로 전환하면 떨이 등록 CTA 와 진행중 떨이가 보인다', async () => {
    const user = userEvent.setup()
    mockProducts([product])
    mockClearances([liveClearance])
    renderPage()

    await user.click(screen.getByRole('tab', { name: '마감 할인' }))
    expect(screen.getByRole('link', { name: /마감 할인 등록하기/ })).toHaveAttribute(
      'href',
      '/clearance/new',
    )
    expect(screen.getByText('진행중 마감 할인')).toBeInTheDocument()
  })

  it('?tab=deal 로 진입하면 마감 할인 탭이 먼저 열린다', () => {
    mockProducts([product])
    mockClearances([liveClearance])
    renderPage('/products?tab=deal')
    expect(screen.getByRole('link', { name: /마감 할인 등록하기/ })).toBeInTheDocument()
  })
})
