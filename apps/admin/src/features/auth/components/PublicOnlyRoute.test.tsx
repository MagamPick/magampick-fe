import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { useAuthStore } from '../stores/authStore'

function renderAt(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <div>login screen</div>
            </PublicOnlyRoute>
          }
        />
        <Route path="/events" element={<div>events screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicOnlyRoute', () => {
  beforeEach(() => useAuthStore.getState().clear())

  it('인증_시_events로_리다이렉트한다', () => {
    useAuthStore.getState().setAccessToken('admin-token')
    renderAt('/login')
    expect(screen.getByText('events screen')).toBeInTheDocument()
    expect(screen.queryByText('login screen')).not.toBeInTheDocument()
  })

  it('비인증_시_children을_렌더한다', () => {
    renderAt('/login')
    expect(screen.getByText('login screen')).toBeInTheDocument()
  })
})
