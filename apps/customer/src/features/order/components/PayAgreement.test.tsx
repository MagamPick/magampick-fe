import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayAgreement } from './PayAgreement'

describe('PayAgreement', () => {
  it('체크박스_토글하면_onChange_호출', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PayAgreement checked={false} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: '결제 동의' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('체크된_상태가_반영', () => {
    render(<PayAgreement checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: '결제 동의' })).toBeChecked()
  })
})
