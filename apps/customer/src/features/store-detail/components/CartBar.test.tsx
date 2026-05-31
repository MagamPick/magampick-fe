import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { CartBar } from './CartBar'

describe('CartBar', () => {
  it('항목수_표시_그리고_탭시_장바구니_준비중', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <CartBar count={3} />
      </ComingSoonProvider>,
    )

    const button = screen.getByRole('button', { name: /장바구니 보기 \(3\)/ })
    await user.click(button)
    expect(await screen.findByText('장바구니는 준비 중이에요.')).toBeInTheDocument()
  })

  it('데스크탑에서_중앙_max_width_고정바로_표시', () => {
    const { container } = render(
      <ComingSoonProvider>
        <CartBar />
      </ComingSoonProvider>,
    )

    expect(container.firstElementChild).toHaveClass(
      'fixed',
      'bottom-0',
      'left-1/2',
      'w-full',
      'max-w-md',
      '-translate-x-1/2',
    )
  })
})
