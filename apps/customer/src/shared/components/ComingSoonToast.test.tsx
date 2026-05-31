import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from './ComingSoonToast'
import { useComingSoon } from '../hooks/useComingSoon'

function Consumer() {
  const { show } = useComingSoon()
  return (
    <button type="button" onClick={() => show('검색은 준비 중이에요.')}>
      검색
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

    expect(screen.queryByText('검색은 준비 중이에요.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '검색' }))

    expect(await screen.findByText('검색은 준비 중이에요.')).toBeInTheDocument()
  })
})
