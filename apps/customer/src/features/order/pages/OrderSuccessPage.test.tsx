import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { OrderSuccessPage } from './OrderSuccessPage'
import type { Order } from '../types'

const order: Order = {
  id: 'ord_1',
  storeId: 'st-1',
  storeName: '브레드샵',
  items: [
    { id: 'd1', kind: 'deal', name: '크루아상', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 2 },
  ],
  pickup: { type: 'slot', time: '19:00' },
  memo: '',
  amounts: { normalTotal: 20000, discountTotal: 8000, payTotal: 12000 },
  pickupCode: '1234',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: '2026-06-01T00:00:00.000Z',
}

function renderSuccess(withState: boolean) {
  const router = createMemoryRouter(
    [
      { path: '/order/success', element: <OrderSuccessPage /> },
      { path: '/', element: <div>HOME PAGE</div> },
    ],
    { initialEntries: withState ? [{ pathname: '/order/success', state: { order } }] : ['/order/success'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('OrderSuccessPage', () => {
  it('주문_정보로_픽업코드_매장_시간_금액_표시', () => {
    renderSuccess(true)
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText('브레드샵')).toBeInTheDocument()
    expect(screen.getByText('19:00')).toBeInTheDocument()
    expect(screen.getByText('12,000원')).toBeInTheDocument()
  })

  it('주문_정보_없이_직접_진입하면_홈으로', () => {
    renderSuccess(false)
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument()
  })
})
