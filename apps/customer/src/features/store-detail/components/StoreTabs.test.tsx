import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoreTabs } from './StoreTabs'

describe('StoreTabs', () => {
  it('4탭_렌더_활성표시_그리고_선택_콜백', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<StoreTabs active="deal" onSelect={onSelect} />)

    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: '마감 할인' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '메뉴' })).toHaveAttribute('aria-selected', 'false')

    await user.click(screen.getByRole('tab', { name: '리뷰' }))
    expect(onSelect).toHaveBeenCalledWith('review')
  })
})
