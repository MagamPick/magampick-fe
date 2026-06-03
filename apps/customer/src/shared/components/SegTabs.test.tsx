import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SegTabs, type SegTabItem } from './SegTabs'

const tabs: SegTabItem<string>[] = [
  { value: 'all', label: '전체' },
  { value: 'earn', label: '적립', count: 3 },
]

describe('SegTabs', () => {
  it('활성 탭에 aria-selected=true', () => {
    render(<SegTabs ariaLabel="필터" tabs={tabs} value="all" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /적립/ })).toHaveAttribute('aria-selected', 'false')
  })

  it('count 배지를 표시', () => {
    render(<SegTabs ariaLabel="필터" tabs={tabs} value="all" onChange={() => {}} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('탭 클릭 시 onChange 호출', async () => {
    const onChange = vi.fn()
    render(<SegTabs ariaLabel="필터" tabs={tabs} value="all" onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: /적립/ }))
    expect(onChange).toHaveBeenCalledWith('earn')
  })
})
