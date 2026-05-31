import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TimePicker } from './TimePicker'

describe('TimePicker — 시각 한 컨트롤 선택', () => {
  it('현재 시각을 한 덩어리(HH:MM)로 표시', () => {
    render(<TimePicker value="09:30" onChange={() => {}} ariaLabel="오픈 시각" />)
    expect(screen.getByRole('button', { name: '오픈 시각' })).toHaveTextContent('09:30')
  })

  it('열면 시·분 두 컬럼이 한 패널에 나오고, 각 선택이 시각을 갱신', async () => {
    const onChange = vi.fn()
    render(<TimePicker value="09:00" onChange={onChange} ariaLabel="오픈 시각" />)
    await userEvent.click(screen.getByRole('button', { name: '오픈 시각' }))

    const hourCol = screen.getByRole('listbox', { name: '시' })
    const minCol = screen.getByRole('listbox', { name: '분' })
    await userEvent.click(within(hourCol).getByRole('option', { name: '10' }))
    expect(onChange).toHaveBeenLastCalledWith('10:00')
    await userEvent.click(within(minCol).getByRole('option', { name: '30' }))
    expect(onChange).toHaveBeenLastCalledWith('09:30')
  })

  it('disabled 면 열리지 않는다', async () => {
    render(<TimePicker value="09:00" onChange={() => {}} ariaLabel="오픈 시각" disabled />)
    await userEvent.click(screen.getByRole('button', { name: '오픈 시각' }))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
