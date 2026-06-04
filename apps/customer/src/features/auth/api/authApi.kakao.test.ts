import { describe, it, expect, vi, beforeEach } from 'vitest'

// 실제 apiClient(=axios 인스턴스, env 파싱) 대신 post 만 가진 mock 으로 교체
vi.mock('@/shared/lib/axios', () => ({ apiClient: { post: vi.fn() } }))

import { apiClient } from '@/shared/lib/axios'
import { authApi } from './authApi'
import { ApiError } from '@/shared/lib/apiError'

describe('authApi.exchangeKakaoCode (POST /auth/kakao)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('인가코드+redirectUri 를 보내고 EXISTING 응답을 파싱', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { status: 'EXISTING', accessToken: 'a', accessExpiresIn: 1800 },
    })
    const r = await authApi.exchangeKakaoCode({
      authorizationCode: 'code1',
      redirectUri: 'http://x/login/kakao/callback',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/kakao', {
      authorizationCode: 'code1',
      redirectUri: 'http://x/login/kakao/callback',
    })
    expect(r).toEqual({ status: 'EXISTING', accessToken: 'a', accessExpiresIn: 1800 })
  })

  it('NEW 응답을 파싱 (nickname 은 옵션 — 카카오 미동의 시 생략 가능)', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { status: 'NEW', socialToken: 'st-uuid', email: 'k@kakao.com' },
    })
    const r = await authApi.exchangeKakaoCode({ authorizationCode: 'c', redirectUri: 'u' })
    expect(r).toEqual({ status: 'NEW', socialToken: 'st-uuid', email: 'k@kakao.com' })
  })

  it('계약과 다른 응답 형상이면 throw (Zod 검증)', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { status: 'WAT' } })
    await expect(
      authApi.exchangeKakaoCode({ authorizationCode: 'c', redirectUri: 'u' }),
    ).rejects.toBeTruthy()
  })

  it('apiClient 가 ApiError 로 reject 하면 그대로 전파(KAKAO_EMAIL_REQUIRED 등)', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new ApiError(400, 'KAKAO_EMAIL_REQUIRED', '이메일 동의 필요'),
    )
    await expect(
      authApi.exchangeKakaoCode({ authorizationCode: 'c', redirectUri: 'u' }),
    ).rejects.toMatchObject({ code: 'KAKAO_EMAIL_REQUIRED' })
  })
})
