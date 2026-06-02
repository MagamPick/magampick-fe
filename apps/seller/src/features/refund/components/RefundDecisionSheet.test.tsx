import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RefundDecisionSheet } from './RefundDecisionSheet'

function setup(props: Partial<Parameters<typeof RefundDecisionSheet>[0]> = {}) {
  const onApprove = vi.fn()
  const onReject = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <RefundDecisionSheet
      open
      onOpenChange={onOpenChange}
      mode="approve"
      amount={6000}
      onApprove={onApprove}
      onReject={onReject}
      {...props}
    />,
  )
  return { onApprove, onReject, onOpenChange }
}

describe('RefundDecisionSheet', () => {
  it('승인 모드: 전액 금액 안내 + 승인하기로 onApprove 를 호출한다', async () => {
    const user = userEvent.setup()
    const { onApprove } = setup({ mode: 'approve' })

    expect(screen.getByText(/6,000원/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '승인하기' }))
    expect(onApprove).toHaveBeenCalled()
  })

  it('거부 모드: 사유가 비면 비활성, 입력 후 trim 된 사유로 onReject 를 호출한다', async () => {
    const user = userEvent.setup()
    const { onReject } = setup({ mode: 'reject' })

    const submit = screen.getByRole('button', { name: '거부하기' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByPlaceholderText(/거부 사유/), '  정상 수령하신 상품이에요  ')
    expect(submit).toBeEnabled()

    await user.click(submit)
    expect(onReject).toHaveBeenCalledWith('정상 수령하신 상품이에요')
  })
})
