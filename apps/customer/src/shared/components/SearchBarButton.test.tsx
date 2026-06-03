import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { SearchBarButton } from './SearchBarButton'

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname}</div>
}

describe('SearchBarButton', () => {
  it('탭하면_검색화면으로_이동', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<SearchBarButton />} />
          <Route path="/search" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /검색해 보세요/ }))
    expect(screen.getByTestId('loc')).toHaveTextContent('/search')
  })
})
