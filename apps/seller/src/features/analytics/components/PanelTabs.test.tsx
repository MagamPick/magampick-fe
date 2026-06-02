import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PanelTabs } from './PanelTabs'

describe('PanelTabs', () => {
  it('4개 패널 탭을 보여주고 현재 탭을 선택 상태로 표시한다', () => {
    render(<PanelTabs value="sales" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: '매출' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '주문' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '리뷰' })).toHaveAttribute('aria-selected', 'false')
  })

  it('탭을 누르면 해당 패널로 onChange 한다', async () => {
    const onChange = vi.fn()
    render(<PanelTabs value="sales" onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: '리뷰' }))
    expect(onChange).toHaveBeenCalledWith('review')
  })
})
