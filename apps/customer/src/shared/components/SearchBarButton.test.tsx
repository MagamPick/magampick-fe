import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { SearchBarButton } from './SearchBarButton'

describe('SearchBarButton', () => {
  it('탭하면_검색_준비중_안내', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <SearchBarButton />
      </ComingSoonProvider>,
    )
    await user.click(screen.getByRole('button', { name: /검색해 보세요/ }))
    expect(await screen.findByText('검색은 준비 중이에요.')).toBeInTheDocument()
  })
})
