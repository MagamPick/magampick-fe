import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { OrderSuccessPage } from './OrderSuccessPage'
import type { Order } from '../types'

const order: Order = {
  id: 'ord_1',
  orderNo: '1001',
  storeId: 'st-1',
  storeName: '브레드샵',
  items: [
    {
      id: 'd1',
      kind: 'deal',
      name: '크루아상',
      imageUrl: null,
      originalPrice: 10000,
      salePrice: 6000,
      qty: 2,
    },
  ],
  pickup: { type: 'slot', time: '19:00' },
  memo: '',
  amounts: { normalTotal: 20000, discountTotal: 8000, payTotal: 12000 },
  pickupCode: '1234',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: '2026-06-01T00:00:00.000Z',
}

function renderSuccess(withState: boolean, orderArg: Order = order) {
  const router = createMemoryRouter(
    [
      { path: '/order/success', element: <OrderSuccessPage /> },
      { path: '/', element: <div>HOME PAGE</div> },
    ],
    {
      initialEntries: withState
        ? [{ pathname: '/order/success', state: { order: orderArg } }]
        : ['/order/success'],
    },
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

  it('실 결제 경로(혜택 적용)면 결제 금액을 실청구액(finalAmount)으로 표시한다 (A4-2)', () => {
    // mapToClientOrder 결과: payTotal=혜택 전(12,000) / finalAmount=실청구(9,500)
    renderSuccess(true, {
      ...order,
      amounts: {
        normalTotal: 20000,
        discountTotal: 8000,
        payTotal: 12000,
        couponDiscount: 2000,
        pointUsed: 500,
        finalAmount: 9500,
      },
    })
    expect(screen.getByText('9,500원')).toBeInTheDocument()
    expect(screen.queryByText('12,000원')).not.toBeInTheDocument()
  })
})
