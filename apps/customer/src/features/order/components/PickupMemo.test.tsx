import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PickupMemo } from './PickupMemo'

describe('PickupMemo', () => {
  it('글자수_카운터_표시', () => {
    const { container } = render(<PickupMemo value="안녕하세요" onChange={() => {}} />)
    expect(container.querySelector('[data-slot="memo-count"]')).toHaveTextContent('5/80')
  })

  it('입력하면_onChange_호출', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PickupMemo value="" onChange={onChange} />)
    await user.type(screen.getByLabelText(/사장님께 전달/), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('빠른문구_칩_클릭하면_값_설정', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PickupMemo value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '포장 부탁드려요' }))
    expect(onChange).toHaveBeenCalledWith('포장 부탁드려요')
  })
})
