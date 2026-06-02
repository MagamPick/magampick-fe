import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { ProductResultRow } from './ProductResultRow'
import type { SearchProductItem } from '../types'

const dealProduct: SearchProductItem = {
  kind: 'deal',
  id: 'p-1',
  storeId: 'st-1',
  storeName: '브레드샵',
  name: '크루아상',
  imageUrl: null,
  originalPrice: 4000,
  salePrice: 2400,
  discountRate: 40,
}

const menuProduct: SearchProductItem = {
  kind: 'menu',
  id: 'p-8',
  storeId: 'st-2',
  storeName: '카페 모리',
  name: '아메리카노',
  imageUrl: null,
  price: 4000,
}

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname}</div>
}

function renderRow(product: SearchProductItem) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ProductResultRow product={product} />} />
        <Route path="/product/:kind/:productId" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProductResultRow', () => {
  it('떨이_상품명_매장_할인_할인가_표시', () => {
    renderRow(dealProduct)
    expect(screen.getByText('크루아상')).toBeInTheDocument()
    expect(screen.getByText(/브레드샵/)).toBeInTheDocument()
    expect(screen.getByText(/40% 할인/)).toBeInTheDocument()
    expect(screen.getByText(/2,400원/)).toBeInTheDocument()
  })

  it('일반상품_정가_표시', () => {
    renderRow(menuProduct)
    expect(screen.getByText('아메리카노')).toBeInTheDocument()
    expect(screen.getByText(/4,000원/)).toBeInTheDocument()
  })

  it('떨이_탭하면_상품상세_deal_경로', async () => {
    const user = userEvent.setup()
    renderRow(dealProduct)
    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/product/deal/p-1')
  })

  it('일반상품_탭하면_상품상세_menu_경로', async () => {
    const user = userEvent.setup()
    renderRow(menuProduct)
    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/product/menu/p-8')
  })
})
