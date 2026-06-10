import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PaymentFailPage } from './PaymentFailPage'

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

  it('다시_결제하기_클릭_시_결제_화면으로_이동', async () => {
    const user = userEvent.setup()
    renderFailPage('?code=ERROR&message=오류')

    await user.click(screen.getByRole('button', { name: '다시 결제하기' }))
    expect(screen.getByText('결제_화면')).toBeInTheDocument()
  })

  it('홈으로_클릭_시_홈_화면으로_이동', async () => {
    const user = userEvent.setup()
    renderFailPage()

    await user.click(screen.getByRole('button', { name: '홈으로' }))
    expect(screen.getByText('홈_화면')).toBeInTheDocument()
  })
})
