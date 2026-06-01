import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from './ComingSoonToast'
import { useComingSoon } from '../hooks/useComingSoon'

function Consumer() {
  const { show } = useComingSoon()
  return (
    <button type="button" onClick={() => show('리뷰 관리는 준비 중이에요.')}>
      리뷰 관리
    </button>
  )
}

describe('ComingSoonProvider', () => {
  it('show_호출_전에는_안내없음_호출후_노출', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <Consumer />
      </ComingSoonProvider>,
    )

    expect(screen.queryByText('리뷰 관리는 준비 중이에요.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '리뷰 관리' }))

    expect(await screen.findByText('리뷰 관리는 준비 중이에요.')).toBeInTheDocument()
  })

  it('토스트_영역을_max_width_컬럼에_맞춘다', () => {
    const { container } = render(
      <ComingSoonProvider>
        <Consumer />
      </ComingSoonProvider>,
    )

    expect(container.lastElementChild).toHaveClass(
      'fixed',
      'left-1/2',
      'w-full',
      'max-w-md',
      '-translate-x-1/2',
    )
  })
})
