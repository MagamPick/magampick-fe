import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PurchaseBar } from './PurchaseBar'
import { useCartStore } from '@/features/cart/stores/cartStore'
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

const resetCart = () => useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })

function renderBar(product: DealProductDetail) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <PurchaseBar product={product} /> },
      { path: '/cart', element: <div>CART PAGE</div> },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('PurchaseBar', () => {
  beforeEach(resetCart)

  it('수량_기본1_증감_하한1', async () => {
    const user = userEvent.setup()
    renderBar(activeDeal)

    expect(screen.getByLabelText('수량')).toHaveTextContent('1')
    await user.click(screen.getByLabelText('수량 증가'))
    expect(screen.getByLabelText('수량')).toHaveTextContent('2')
    await user.click(screen.getByLabelText('수량 감소'))
    expect(screen.getByLabelText('수량')).toHaveTextContent('1')
    expect(screen.getByLabelText('수량 감소')).toBeDisabled()
  })

  it('떨이_재고상한에서_증가버튼_비활성', async () => {
    const user = userEvent.setup()
    renderBar({ ...activeDeal, stockLeft: 2 })

    await user.click(screen.getByLabelText('수량 증가')) // → 2 (상한)
    expect(screen.getByLabelText('수량')).toHaveTextContent('2')
    expect(screen.getByLabelText('수량 증가')).toBeDisabled()
  })

  it('마감_떨이_사유라벨_그리고_담기_비활성', () => {
    renderBar({ ...activeDeal, dealStatus: 'SOLD_OUT', stockLeft: 0 })

    expect(screen.getByText('마감된 상품이에요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '장바구니 담기' })).toBeDisabled()
  })

  it('담기시_장바구니에_추가되고_장바구니로_이동', async () => {
    const user = userEvent.setup()
    renderBar(activeDeal)

    await user.click(screen.getByLabelText('수량 증가')) // qty 2
    await user.click(screen.getByRole('button', { name: '장바구니 담기' }))

    const cart = useCartStore.getState()
    expect(cart.store?.id).toBe('st-1')
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ id: 'sd-1', qty: 2, originalPrice: 9000, salePrice: 4500 })
    expect(screen.getByText('CART PAGE')).toBeInTheDocument()
  })

  it('다른_매장_상품_있으면_확인후_비우고_담고_이동', async () => {
    useCartStore.getState().addItem({
      store: { id: 'st-9', name: '다른가게', closingTime: '20:00' },
      item: { id: 'x1', kind: 'menu', name: '다른상품', imageUrl: null, originalPrice: 1000, salePrice: 1000 },
      qty: 1,
    })
    const user = userEvent.setup()
    renderBar(activeDeal)

    await user.click(screen.getByRole('button', { name: '장바구니 담기' }))
    // 확인 시트 노출 (아직 미교체)
    expect(screen.getByText('다른 매장 상품을 담을까요?')).toBeInTheDocument()
    expect(useCartStore.getState().store?.id).toBe('st-9')

    await user.click(screen.getByRole('button', { name: '비우고 담기' }))

    const cart = useCartStore.getState()
    expect(cart.store?.id).toBe('st-1')
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].id).toBe('sd-1')
    expect(screen.getByText('CART PAGE')).toBeInTheDocument()
  })

  it('데스크탑에서_중앙_max_width_고정바로_표시', () => {
    renderBar(activeDeal)
    const bar = screen.getByRole('button', { name: '장바구니 담기' }).closest('div.fixed')
    expect(bar).toHaveClass('fixed', 'bottom-0', 'left-1/2', 'w-full', 'max-w-md', '-translate-x-1/2')
  })
})
