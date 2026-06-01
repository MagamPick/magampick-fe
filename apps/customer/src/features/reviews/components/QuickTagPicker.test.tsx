import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickTagPicker } from './QuickTagPicker'

describe('QuickTagPicker', () => {
  it('태그_클릭_시_선택_추가', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<QuickTagPicker value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '맛있어요' }))
    expect(onChange).toHaveBeenCalledWith(['맛있어요'])
  })

  it('이미_선택된_태그_클릭_시_해제', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<QuickTagPicker value={['맛있어요']} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '맛있어요' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('선택된_태그는_aria_pressed_true', () => {
    render(<QuickTagPicker value={['신선해요']} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '신선해요' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
