import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from './ReviewForm'

const baseProps = {
  storeName: '베이커리 브레드샵',
  items: [{ productId: 'sd-1', kind: 'deal' as const, name: '크루아상 세트' }],
  isPending: false,
  submitLabel: '리뷰 등록',
}

describe('ReviewForm', () => {
  it('별점_미선택_시_제출_버튼_비활성', () => {
    render(<ReviewForm {...baseProps} onSubmit={() => {}} />)
    expect(screen.getByRole('button', { name: '리뷰 등록' })).toBeDisabled()
  })

  it('별점_선택_시_제출_버튼_활성', async () => {
    const user = userEvent.setup()
    render(<ReviewForm {...baseProps} onSubmit={() => {}} />)
    await user.click(screen.getByRole('radio', { name: '5점' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '리뷰 등록' })).toBeEnabled())
  })

  it('제출_시_입력값으로_onSubmit', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ReviewForm {...baseProps} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('radio', { name: '4점' }))
    await user.click(screen.getByRole('button', { name: '리뷰 등록' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ rating: 4 })
  })

  it('매장_정보와_상품_표시', () => {
    render(<ReviewForm {...baseProps} onSubmit={() => {}} />)
    expect(screen.getByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(screen.getByText('크루아상 세트')).toBeInTheDocument()
  })
})
