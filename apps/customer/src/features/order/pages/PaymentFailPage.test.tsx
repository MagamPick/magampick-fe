import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PaymentFailPage } from './PaymentFailPage'
import * as paymentSession from '../lib/paymentSession'

vi.mock('../lib/paymentSession', async (importOriginal) => {
  const actual = await importOriginal<typeof paymentSession>()
  return { ...actual, clearPaymentSession: vi.fn() }
})

function renderFailPage(queryString = '') {
  const router = createMemoryRouter(
    [
      {
        path: '/order/payment/fail',
        element: <PaymentFailPage />,
      },
      { path: '/checkout', element: <div>결제_화면</div> },
      { path: '/', element: <div>홈_화면</div> },
    ],
    { initialEntries: [`/order/payment/fail${queryString}`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('PaymentFailPage', () => {
  beforeEach(() => {
    vi.mocked(paymentSession.clearPaymentSession).mockClear()
  })

  it('에러_코드·메시지를_표시', () => {
    renderFailPage('?code=PAY_PROCESS_CANCELED&message=사용자가+결제를+취소했습니다')

    expect(screen.getByText('결제에 실패했어요')).toBeInTheDocument()
    expect(screen.getByText('사용자가 결제를 취소했습니다')).toBeInTheDocument()
    expect(screen.getByText('PAY_PROCESS_CANCELED')).toBeInTheDocument()
  })

  it('쿼리_없으면_기본_메시지_표시', () => {
    renderFailPage()

    expect(screen.getByText('결제에 실패했어요')).toBeInTheDocument()
    expect(screen.getByText('결제에 실패했어요.')).toBeInTheDocument()
  })

  it('다시_결제하기_클릭_시_세션_정리_후_결제_화면으로_이동', async () => {
    const user = userEvent.setup()
    renderFailPage('?code=ERROR&message=오류')

    await user.click(screen.getByRole('button', { name: '다시 결제하기' }))

    expect(paymentSession.clearPaymentSession).toHaveBeenCalledOnce()
    expect(screen.getByText('결제_화면')).toBeInTheDocument()
  })

  it('홈으로_클릭_시_세션_정리_후_홈_화면으로_이동', async () => {
    const user = userEvent.setup()
    renderFailPage()

    await user.click(screen.getByRole('button', { name: '홈으로' }))

    expect(paymentSession.clearPaymentSession).toHaveBeenCalledOnce()
    expect(screen.getByText('홈_화면')).toBeInTheDocument()
  })
})
