import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RefundRequestSheet } from './RefundRequestSheet'

function setup(props: Partial<Parameters<typeof RefundRequestSheet>[0]> = {}) {
  const onConfirm = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <RefundRequestSheet
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      amount={7800}
      {...props}
    />,
  )
  return { onConfirm, onOpenChange }
}

describe('RefundRequestSheet', () => {
  it('열리면 제목과 전액 환불 금액을 보여준다', () => {
    setup()
    expect(screen.getByText('환불을 요청할까요?')).toBeInTheDocument()
    expect(screen.getByText(/7,800원/)).toBeInTheDocument()
  })

  it('사유가 비어 있으면 요청 버튼이 비활성화된다', () => {
    setup()
    expect(screen.getByRole('button', { name: '환불 요청하기' })).toBeDisabled()
  })

  it('사유 입력 후 요청하면 trim 된 사유와 함께 onConfirm 을 호출한다', async () => {
    const user = userEvent.setup()
    const { onConfirm } = setup()

    await user.type(screen.getByPlaceholderText(/환불 사유/), '  상품 상태가 안 좋아요  ')
    const submit = screen.getByRole('button', { name: '환불 요청하기' })
    expect(submit).toBeEnabled()

    await user.click(submit)
    expect(onConfirm).toHaveBeenCalledWith('상품 상태가 안 좋아요')
  })

  it('처리 중이면 버튼이 비활성화되고 라벨이 바뀐다', () => {
    setup({ isPending: true })
    expect(screen.getByRole('button', { name: '요청 중…' })).toBeDisabled()
  })
})
