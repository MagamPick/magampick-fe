import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchHeader } from './SearchHeader'

function setup(value = '') {
  const handlers = { onChange: vi.fn(), onSubmit: vi.fn(), onClear: vi.fn(), onBack: vi.fn() }
  render(<SearchHeader value={value} {...handlers} />)
  return handlers
}

describe('SearchHeader', () => {
  it('입력하면_onChange', async () => {
    const user = userEvent.setup()
    const { onChange } = setup('')
    await user.type(screen.getByLabelText('검색어 입력'), '빵')
    expect(onChange).toHaveBeenCalled()
  })

  it('Enter로_onSubmit', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup('빵')
    screen.getByLabelText('검색어 입력').focus()
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalled()
  })

  it('값있으면_지우기버튼_노출_클릭시_onClear', async () => {
    const user = userEvent.setup()
    const { onClear } = setup('빵')
    await user.click(screen.getByLabelText('입력 지우기'))
    expect(onClear).toHaveBeenCalled()
  })

  it('값없으면_지우기버튼_없음', () => {
    setup('')
    expect(screen.queryByLabelText('입력 지우기')).toBeNull()
  })

  it('뒤로가기_클릭시_onBack', async () => {
    const user = userEvent.setup()
    const { onBack } = setup('')
    await user.click(screen.getByLabelText('뒤로 가기'))
    expect(onBack).toHaveBeenCalled()
  })
})
