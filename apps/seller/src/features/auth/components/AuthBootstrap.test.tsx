import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthBootstrap } from './AuthBootstrap'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

vi.mock('../api/authApi')

describe('AuthBootstrap (사장 세션 복원 — findings BUG-C)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('refresh쿠키가_유효하면_accessToken을_복구하고_children을_렌더한다', async () => {
    vi.mocked(authApi.refreshAccessToken).mockResolvedValue({ accessToken: 'refreshed-token' })

    render(
      <AuthBootstrap>
        <div>ready</div>
      </AuthBootstrap>,
    )

    // 부팅 중에는 라우터(children) 렌더를 보류
    expect(screen.queryByText('ready')).not.toBeInTheDocument()
    expect(await screen.findByText('ready')).toBeInTheDocument()
    expect(useAuthStore.getState().accessToken).toBe('refreshed-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('refresh쿠키가_없거나_만료면_비로그인_상태로_children을_렌더한다', async () => {
    vi.mocked(authApi.refreshAccessToken).mockRejectedValue(new Error('REFRESH_INVALID'))

    render(
      <AuthBootstrap>
        <div>ready</div>
      </AuthBootstrap>,
    )

    expect(await screen.findByText('ready')).toBeInTheDocument()
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false))
    expect(useAuthStore.getState().accessToken).toBe(null)
  })
})
