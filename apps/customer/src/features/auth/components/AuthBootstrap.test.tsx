import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthBootstrap } from './AuthBootstrap'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

vi.mock('../api/authApi')

describe('AuthBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,
    })
  })

  it('refresh_cookie가_유효하면_accessToken을_복구하고_children을_렌더링한다', async () => {
    vi.mocked(authApi.refreshAccessToken).mockResolvedValue({
      accessToken: 'refreshed-access-token',
    })

    render(
      <AuthBootstrap>
        <div>ready</div>
      </AuthBootstrap>,
    )

    expect(screen.queryByText('ready')).not.toBeInTheDocument()
    expect(await screen.findByText('ready')).toBeInTheDocument()
    expect(useAuthStore.getState().accessToken).toBe('refreshed-access-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().isInitialized).toBe(true)
  })

  it('refresh_cookie가_없거나_만료되면_비로그인_상태로_children을_렌더링한다', async () => {
    vi.mocked(authApi.refreshAccessToken).mockRejectedValue(new Error('refresh failed'))

    render(
      <AuthBootstrap>
        <div>ready</div>
      </AuthBootstrap>,
    )

    expect(await screen.findByText('ready')).toBeInTheDocument()
    await waitFor(() => expect(useAuthStore.getState().isInitialized).toBe(true))
    expect(useAuthStore.getState().accessToken).toBe(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
