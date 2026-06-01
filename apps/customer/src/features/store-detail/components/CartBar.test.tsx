import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { CartBar } from './CartBar'
import { useCartStore } from '@/features/cart/stores/cartStore'

const resetCart = () => useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })

function renderBar() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <CartBar /> },
      { path: '/cart', element: <div>CART PAGE</div> },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('CartBar', () => {
  beforeEach(resetCart)

  it('장바구니_수량_표시하고_탭시_장바구니로_이동', async () => {
    useCartStore.getState().addItem({
      store: { id: 'st-1', name: '브레드샵', closingTime: '20:00' },
      item: { id: 'd1', kind: 'deal', name: 'x', imageUrl: null, originalPrice: 1000, salePrice: 800 },
      qty: 3,
    })
    const user = userEvent.setup()
    renderBar()

    await user.click(screen.getByRole('button', { name: /장바구니 보기 \(3\)/ }))
    expect(screen.getByText('CART PAGE')).toBeInTheDocument()
  })

  it('빈_장바구니면_수량_숨김', () => {
    renderBar()
    expect(screen.getByRole('button', { name: '장바구니 보기' })).toBeInTheDocument()
  })

  it('데스크탑에서_중앙_max_width_고정바로_표시', () => {
    renderBar()
    const bar = screen.getByRole('button', { name: /장바구니 보기/ }).closest('div')
    expect(bar).toHaveClass('fixed', 'bottom-0', 'left-1/2', 'w-full', 'max-w-md', '-translate-x-1/2')
  })
})
