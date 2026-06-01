import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../hooks/useProducts')
import { useProducts } from '../hooks/useProducts'
import { ProductListPage } from './ProductListPage'
import type { Product } from '../types'

function mockProducts(data: Product[] | undefined, isLoading = false) {
  vi.mocked(useProducts).mockReturnValue({ data, isLoading } as unknown as ReturnType<
    typeof useProducts
  >)
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductListPage />
    </MemoryRouter>,
  )
}

describe('ProductListPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('상품 등록하기 CTA 가 등록 화면으로 연결된다', () => {
    mockProducts([])
    renderPage()
    expect(screen.getByRole('link', { name: /상품 등록하기/ })).toHaveAttribute(
      'href',
      '/products/new',
    )
  })

  it('상품이 하나도 없으면 빈 상태 안내를 보여준다', () => {
    mockProducts([])
    renderPage()
    expect(screen.getByText(/첫 상품을 등록/)).toBeInTheDocument()
  })

  it('상품을 카드로 보여주고 판매 상태 배지를 표시한다', () => {
    mockProducts([
      {
        id: 'p1',
        storeId: 's1',
        name: '통밀 식빵',
        category: '베이커리',
        price: 4800,
        onSale: true,
      },
      { id: 'p2', storeId: 's1', name: '카페라떼', category: '음료', price: 4000, onSale: false },
    ])
    renderPage()
    expect(screen.getByText('통밀 식빵')).toBeInTheDocument()
    expect(screen.getByText('카페라떼')).toBeInTheDocument()
    expect(screen.getByText('판매중지')).toBeInTheDocument()
  })
})
