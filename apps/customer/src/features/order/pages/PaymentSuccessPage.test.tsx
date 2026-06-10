import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaymentSuccessPage } from './PaymentSuccessPage'
import { paymentApi } from '../api/paymentApi'
import { restorePaymentSession, clearPaymentSession } from '../lib/paymentSession'
import type { TossConfirmResponse } from '../api/paymentApi'

vi.mock('../api/paymentApi', () => ({
  paymentApi: { confirm: vi.fn() },
  mapToClientOrder: vi.fn((res: TossConfirmResponse) => ({
    id: String(res.id ?? 0),
    orderNo: res.orderNo ?? '',
    storeId: String(res.storeId ?? 0),
    storeName: res.storeName ?? '',
    items: [],
    pickup: { type: 'asap' },
    memo: '',
    amounts: { normalTotal: 0, discountTotal: 0, payTotal: 6000 },
    pickupCode: res.pickupCode ?? '0000',
    status: 'PENDING',
    paymentMethod: 'toss',
    createdAt: '2026-06-10T10:00:00.000Z',
  })),
}))

vi.mock('../lib/paymentSession', () => ({
  restorePaymentSession: vi.fn(),
  clearPaymentSession: vi.fn(),
}))

const mockConfirmResponse: TossConfirmResponse = {
  id: 42,
  orderNo: '0042',
  storeId: 1,
  storeName: '브레드샵',
  items: [],
  pickup: { type: 'ASAP' },
  memo: '',
  amounts: { normalTotal: 6000, discountTotal: 0, payTotal: 6000 },
  pickupCode: '3827',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: '2026-06-10T10:00:00.000Z',
}

function renderSuccessPage(queryString = '?paymentKey=test_pk&orderId=order-42&amount=6000') {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      {
        path: '/order/payment/success',
        element: <PaymentSuccessPage />,
      },
      {
        path: '/order/success',
        element: <div>주문완료_화면</div>,
      },
      {
        path: '/checkout',
        element: <div>결제_화면</div>,
      },
      {
        path: '/',
        element: <div>홈_화면</div>,
      },
    ],
    { initialEntries: [`/order/payment/success${queryString}`] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    vi.mocked(restorePaymentSession).mockReturnValue({ orderId: 42, amount: 6000 })
    vi.mocked(clearPaymentSession).mockImplementation(() => {})
    vi.mocked(paymentApi.confirm).mockReset()
  })

  it('confirm_성공_시_주문완료_화면으로_이동', async () => {
    vi.mocked(paymentApi.confirm).mockResolvedValueOnce(mockConfirmResponse)

    renderSuccessPage()

    await waitFor(() => expect(screen.getByText('주문완료_화면')).toBeInTheDocument(), {
      timeout: 3000,
    })
    expect(paymentApi.confirm).toHaveBeenCalledWith({
      paymentKey: 'test_pk',
      orderId: 42,
      amount: 6000,
    })
    expect(clearPaymentSession).toHaveBeenCalled()
  })

  it('confirm_실패_시_에러_메시지와_결제화면_복귀_버튼_표시', async () => {
    vi.mocked(paymentApi.confirm).mockRejectedValueOnce(new Error('결제 승인 실패'))

    renderSuccessPage()

    await waitFor(
      () => expect(screen.getByText(/결제 승인 실패/)).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.getByRole('button', { name: /결제 화면으로 돌아가기/ })).toBeInTheDocument()
  })

  it('amount_불일치_시_금액_불일치_메시지_표시', async () => {
    // URL amount=9999 ≠ session amount=6000
    renderSuccessPage('?paymentKey=test_pk&orderId=order-42&amount=9999')

    expect(screen.getByText(/결제 금액이 맞지 않아/)).toBeInTheDocument()
    expect(paymentApi.confirm).not.toHaveBeenCalled()
  })

  it('세션_없으면_잘못된_접근_메시지_표시', async () => {
    vi.mocked(restorePaymentSession).mockReturnValue(null)

    renderSuccessPage()

    expect(screen.getByText(/잘못된 접근/)).toBeInTheDocument()
    expect(paymentApi.confirm).not.toHaveBeenCalled()
  })

  it('amount_불일치_화면에서_결제화면으로_돌아가기_버튼_클릭', async () => {
    const user = userEvent.setup()
    renderSuccessPage('?paymentKey=test_pk&orderId=order-42&amount=9999')

    await user.click(screen.getByRole('button', { name: /결제 화면으로 돌아가기/ }))
    expect(screen.getByText('결제_화면')).toBeInTheDocument()
  })
})
