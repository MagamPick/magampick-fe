import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecentSearches } from './RecentSearches'

const noop = () => {}

describe('RecentSearches', () => {
  it('기록_없으면_아무것도_안_보임', () => {
    const { container } = render(
      <RecentSearches items={[]} onSelect={noop} onRemove={noop} onClear={noop} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('칩_탭하면_그_검색어로_onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <RecentSearches items={['크루아상', '라떼']} onSelect={onSelect} onRemove={noop} onClear={noop} />,
    )
    await user.click(screen.getByRole('button', { name: '크루아상' }))
    expect(onSelect).toHaveBeenCalledWith('크루아상')
  })

  it('✕_누르면_개별_onRemove', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<RecentSearches items={['크루아상']} onSelect={noop} onRemove={onRemove} onClear={noop} />)
    await user.click(screen.getByLabelText('크루아상 삭제'))
    expect(onRemove).toHaveBeenCalledWith('크루아상')
  })

  it('전체삭제_누르면_onClear', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<RecentSearches items={['a']} onSelect={noop} onRemove={noop} onClear={onClear} />)
    await user.click(screen.getByRole('button', { name: '전체 삭제' }))
    expect(onClear).toHaveBeenCalled()
  })
})
