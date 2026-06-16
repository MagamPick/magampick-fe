import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CheckoutPage } from './CheckoutPage'
import { useCartStore } from '@/features/cart/stores/cartStore'
import type { CartItem } from '@/features/cart/types'

// 결제 = 실 결제 흐름(prepare→토스 결제창 리다이렉트). CheckoutPage 의 책임은
// 결제 페이로드를 모아 usePrepareAndPay.mutate 로 넘기는 것까지 — 결제창/리다이렉트는 SDK 담당.
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))
vi.mock('../hooks/usePrepareAndPay', () => ({
  usePrepareAndPay: () => ({ mutate, isPending: false }),
}))

const items: CartItem[] = [
  {
    id: 'd1',
    kind: 'deal',
    name: '크루아상 세트',
    imageUrl: null,
    originalPrice: 10000,
    salePrice: 6000,
    qty: 2,
  },
]
const fill = () =>
  useCartStore.setState({
    store: { id: 'st-1', name: '브레드샵', closingTime: '21:00' },
    items,
    pickup: { type: 'asap' },
  })
const empty = () => useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })

function renderCheckout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      { path: '/checkout', element: <CheckoutPage /> },
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
  beforeEach(() => {
    mutate.mockClear()
    empty()
  })

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

  it('동의후_결제하면_실결제흐름(prepareAndPay)_을_주문페이로드로_호출', async () => {
    fill()
    const user = userEvent.setup()
    renderCheckout()

    await user.click(screen.getByRole('checkbox', { name: '결제 동의' }))
    await user.click(screen.getByRole('button', { name: /결제하기/ }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        store: { id: 'st-1', name: '브레드샵' },
        amounts: expect.objectContaining({ payTotal: 12000, normalTotal: 20000, finalAmount: 12000 }),
      }),
    )
  })
})
