import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TempClosureCard } from './TempClosureCard'

describe('TempClosureCard — 오늘 하루 임시휴업', () => {
  it('closedToday=true 면 스위치가 켜져 있다', () => {
    render(<TempClosureCard closedToday onToggle={() => {}} />)
    expect(screen.getByRole('switch', { name: '오늘 하루 임시휴업' })).toBeChecked()
  })

  it('closedToday=false 면 꺼져 있고, 토글 시 onToggle(true)', async () => {
    const onToggle = vi.fn()
    render(<TempClosureCard closedToday={false} onToggle={onToggle} />)
    const sw = screen.getByRole('switch', { name: '오늘 하루 임시휴업' })
    expect(sw).not.toBeChecked()
    await userEvent.click(sw)
    expect(onToggle).toHaveBeenCalledWith(true)
  })
})
