import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { DealCard } from './DealCard'
import type { ClosingDeal } from '../types'

const deal: ClosingDeal = {
  id: 'cd-1',
  storeName: '브레드샵',
  productName: '크루아상 세트',
  imageUrl: null,
  discountRate: 50,
  originalPrice: 9000,
  salePrice: 4500,
  pickupDeadline: new Date(Date.now() + 12 * 60_000).toISOString(),
}

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname + loc.search}</div>
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<DealCard deal={deal} />} />
        <Route path="/product/:kind/:productId" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DealCard', () => {
  it('매장명_상품명_가격_카운트다운_표시', () => {
    renderCard()

    expect(screen.getByText('브레드샵')).toBeInTheDocument()
    expect(screen.getByText('크루아상 세트')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('9,000원')).toBeInTheDocument()
    expect(screen.getByText('4,500원')).toBeInTheDocument()
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument() // 카운트다운 MM:SS
  })

  it('탭하면_상품상세로_이동', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/product/deal/cd-1')
  })
})
