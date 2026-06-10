import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceBlock } from './PriceBlock'
import type { DealProductDetail, MenuProductDetail } from '../types'

const menu: MenuProductDetail = {
  kind: 'menu',
  id: 1,
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '소금빵',
  description: null,
  rating: 4.5,
  reviewCount: 10,
  closingTime: '21:00',
  price: 3500,
  isOnSale: true,
}

const deal: DealProductDetail = {
  kind: 'deal',
  id: 1,
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '크루아상 세트',
  description: null,
  rating: 4.8,
  reviewCount: 36,
  closingTime: '21:00',
  originalPrice: 9000,
  salePrice: 4500,
  discountRate: 50,
  pickupDeadline: new Date(Date.now() + 30 * 60_000).toISOString(),
  stockLeft: 5,
  dealStatus: 'ACTIVE',
}

describe('PriceBlock', () => {
  it('일반상품_정가만_표시', () => {
    render(<PriceBlock product={menu} />)
    expect(screen.getByText('3,500원')).toBeInTheDocument()
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('떨이_할인율_원가_할인가_표시', () => {
    render(<PriceBlock product={deal} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('9,000원')).toBeInTheDocument()
    expect(screen.getByText('4,500원')).toBeInTheDocument()
  })
})
