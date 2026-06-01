import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { CartPage } from './CartPage'
import { useCartStore } from '../stores/cartStore'
import type { CartItem } from '../types'

const items: CartItem[] = [
  { id: 'd1', kind: 'deal', name: '크루아상 세트', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 2 },
  { id: 'm1', kind: 'menu', name: '아메리카노', imageUrl: null, originalPrice: 4000, salePrice: 4000, qty: 1 },
]
// 결제 예정 = 12000 + 4000 = 16000

const fill = () =>
  useCartStore.setState({
    store: { id: 'st-1', name: '브레드샵', closingTime: '23:00' },
    items,
    pickup: { type: 'asap' },
  })
const empty = () => useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })

function renderCart() {
  const router = createMemoryRouter([{ path: '/', element: <CartPage /> }], { initialEntries: ['/'] })
  return render(<RouterProvider router={router} />)
}

describe('CartPage', () => {
  beforeEach(empty)

  it('빈_장바구니면_안내문구_노출하고_CTA_없음', () => {
    renderCart()
    expect(screen.getByText('장바구니가 비었어요')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /결제하기/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '전체 삭제' })).not.toBeInTheDocument()
  })

  it('항목이_있으면_매장명_상품_픽업_결제CTA_노출', () => {
    fill()
    renderCart()
    expect(screen.getByText('브레드샵')).toBeInTheDocument()
    expect(screen.getByText('크루아상 세트')).toBeInTheDocument()
    expect(screen.getByText('픽업 시간')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /결제하기/ })).toHaveTextContent('16,000원')
  })

  it('결제하기는_준비중_안내', async () => {
    fill()
    const user = userEvent.setup()
    renderCart()
    await user.click(screen.getByRole('button', { name: /결제하기/ }))
    expect(await screen.findByText('결제 기능은 준비 중이에요.')).toBeInTheDocument()
  })

  it('전체삭제_확인후_장바구니_비움', async () => {
    fill()
    const user = userEvent.setup()
    renderCart()
    await user.click(screen.getByRole('button', { name: '전체 삭제' }))
    expect(screen.getByText('장바구니를 비울까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '비우기' }))
    expect(screen.getByText('장바구니가 비었어요')).toBeInTheDocument()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
