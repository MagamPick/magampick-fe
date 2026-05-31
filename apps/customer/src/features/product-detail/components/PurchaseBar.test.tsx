import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { PurchaseBar } from './PurchaseBar'
import type { DealProductDetail } from '../types'

const activeDeal: DealProductDetail = {
  kind: 'deal',
  id: 'sd-1',
  storeId: 'st-1',
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '크루아상 세트',
  description: null,
  rating: 4.8,
  reviewCount: 36,
  originalPrice: 9000,
  salePrice: 4500,
  discountRate: 50,
  pickupDeadline: new Date(Date.now() + 30 * 60_000).toISOString(),
  stockLeft: 5,
  dealStatus: 'ACTIVE',
}

function renderBar(product: DealProductDetail) {
  return render(
    <ComingSoonProvider>
      <PurchaseBar product={product} />
    </ComingSoonProvider>,
  )
}

describe('PurchaseBar', () => {
  it('수량_기본1_증감_하한1_그리고_담기_안내', async () => {
    const user = userEvent.setup()
    renderBar(activeDeal)

    expect(screen.getByText('1')).toBeInTheDocument()
    await user.click(screen.getByLabelText('수량 증가'))
    expect(screen.getByText('2')).toBeInTheDocument()
    await user.click(screen.getByLabelText('수량 감소'))
    expect(screen.getByText('1')).toBeInTheDocument()
    // 하한 1 — 감소 버튼 비활성
    expect(screen.getByLabelText('수량 감소')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '장바구니 담기' }))
    expect(await screen.findByText('장바구니는 준비 중이에요.')).toBeInTheDocument()
  })

  it('떨이_재고상한에서_증가버튼_비활성', async () => {
    const user = userEvent.setup()
    renderBar({ ...activeDeal, stockLeft: 2 })

    await user.click(screen.getByLabelText('수량 증가')) // → 2 (상한)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByLabelText('수량 증가')).toBeDisabled()
  })

  it('마감_떨이_사유라벨_그리고_담기_비활성', () => {
    renderBar({ ...activeDeal, dealStatus: 'SOLD_OUT', stockLeft: 0 })

    expect(screen.getByText('마감된 상품이에요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '장바구니 담기' })).toBeDisabled()
  })
})
