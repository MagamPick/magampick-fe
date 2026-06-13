import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from './authApi'
import { apiClient } from '@/shared/lib/axios'

// seller/customer 패턴 — MSW 아님, apiClient 자체를 목킹 ({ data } payload)
vi.mock('@/shared/lib/axios', () => ({
  apiClient: { post: vi.fn() },
}))

describe('authApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login_은_username_password를_admin_login_엔드포인트로_보내고_accessToken만_돌려준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: 'a1', accessExpiresIn: 3600 },
    })
    const result = await authApi.login({ username: 'admin', password: 'pw1234' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/admin/login', {
      username: 'admin',
      password: 'pw1234',
    })
    expect(result).toEqual({ accessToken: 'a1' })
  })

  it('refreshAccessToken_은_공통_auth_refresh를_body없이_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'r1' } })
    const result = await authApi.refreshAccessToken()
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh')
    expect(result).toEqual({ accessToken: 'r1' })
  })

  it('logout_은_auth_logout을_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })
    await authApi.logout()
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
  })
})
