import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationSettingItem } from './NotificationSettingItem'
import type { SettingMeta } from '../constants'

const meta: SettingMeta = { key: 'marketing', label: '마케팅 정보', desc: '광고성 정보' }

describe('NotificationSettingItem', () => {
  it('라벨·설명을 보여주고 상태를 반영한다', () => {
    render(<NotificationSettingItem meta={meta} checked={false} onCheckedChange={vi.fn()} />)
    expect(screen.getByText('마케팅 정보')).toBeInTheDocument()
    expect(screen.getByText('광고성 정보')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: '마케팅 정보' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('토글하면 onCheckedChange 를 호출한다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NotificationSettingItem meta={meta} checked={false} onCheckedChange={onChange} />)
    await user.click(screen.getByRole('switch', { name: '마케팅 정보' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
