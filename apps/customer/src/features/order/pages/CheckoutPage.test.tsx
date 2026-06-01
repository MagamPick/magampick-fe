import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CheckoutPage } from './CheckoutPage'
import { OrderSuccessPage } from './OrderSuccessPage'
import { useCartStore } from '@/features/cart/stores/cartStore'
import type { CartItem } from '@/features/cart/types'

const items: CartItem[] = [
  { id: 'd1', kind: 'deal', name: '크루아상 세트', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 2 },
]
const fill = () =>
  useCartStore.setState({
    store: { id: 'st-1', name: '브레드샵', closingTime: '21:00' },
    items,
    pickup: { type: 'asap' },
  })
const empty = () => useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })

function renderCheckout() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order/success', element: <OrderSuccessPage /> },
      { path: '/cart', element: <div>CART PAGE</div> },
    ],
    { initialEntries: ['/checkout'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('CheckoutPage', () => {
  beforeEach(empty)

  it('빈_장바구니면_장바구니로_되돌림', () => {
    renderCheckout()
    expect(screen.getByText('CART PAGE')).toBeInTheDocument()
  })

  it('동의_전엔_결제버튼_비활성_동의하면_활성', async () => {
    fill()
    const user = userEvent.setup()
    renderCheckout()

    const payBtn = screen.getByRole('button', { name: /결제하기/ })
    expect(payBtn).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: '결제 동의' }))
    expect(payBtn).toBeEnabled()
  })

  it('동의후_결제하면_주문완료_화면이_뜨고_장바구니_비움', async () => {
    fill()
    const user = userEvent.setup()
    renderCheckout()

    await user.click(screen.getByRole('checkbox', { name: '결제 동의' }))
    await user.click(screen.getByRole('button', { name: /결제하기/ }))

    expect(await screen.findByText('주문이 완료되었어요', undefined, { timeout: 3000 })).toBeInTheDocument()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
