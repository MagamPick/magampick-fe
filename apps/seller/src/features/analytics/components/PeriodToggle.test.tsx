import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PeriodToggle } from './PeriodToggle'

describe('PeriodToggle', () => {
  it('4개 기간 칩을 보여주고 현재 기간을 눌림 상태로 표시한다', () => {
    render(<PeriodToggle value="week" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '오늘' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '이번 주' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '올해' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('칩을 누르면 해당 기간으로 onChange 한다', async () => {
    const onChange = vi.fn()
    render(<PeriodToggle value="today" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '올해' }))
    expect(onChange).toHaveBeenCalledWith('year')
  })
})
