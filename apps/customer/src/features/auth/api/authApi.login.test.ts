import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { authApi } from './authApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

describe('authApi 로그인/로그아웃', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('소비자_로그인_API를_호출하고_accessToken을_반환한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: 'access-token', accessExpiresIn: 1800 },
    })

    await expect(
      authApi.login({
        email: 'user@magampick.com',
        password: 'abcd1234!',
        keepSignedIn: true,
      }),
    ).resolves.toEqual({ accessToken: 'access-token', accessExpiresIn: 1800 })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'user@magampick.com',
      password: 'abcd1234!',
      keepSignedIn: true,
    })
  })

  it('로그아웃_API를_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await expect(authApi.logout()).resolves.toBeUndefined()

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('refresh_cookie로_accessToken을_갱신한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: 'refreshed-access-token', accessExpiresIn: 1800 },
    })

    await expect(authApi.refreshAccessToken()).resolves.toEqual({
      accessToken: 'refreshed-access-token',
      accessExpiresIn: 1800,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh')
  })
})
