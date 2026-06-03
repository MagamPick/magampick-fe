import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoreSortTabs } from './StoreSortTabs'

describe('StoreSortTabs', () => {
  it('정렬_5종_칩_렌더_현재정렬은_active', () => {
    render(<StoreSortTabs value="recommended" onChange={() => {}} />)

    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.getByRole('button', { name: '추천순' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '거리순' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('다른_칩_클릭시_해당_정렬로_onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StoreSortTabs value="recommended" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '마감임박순' }))
    expect(onChange).toHaveBeenCalledWith('closing')
  })
})
