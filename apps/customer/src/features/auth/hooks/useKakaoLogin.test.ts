import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKakaoLogin } from './useKakaoLogin'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import { ApiError } from '@/shared/lib/apiError'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi')

describe('useKakaoLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('기존회원_시_토큰저장_홈이동', async () => {
    vi.mocked(authApi.kakaoAuthorize).mockResolvedValue({
      status: 'existing',
      accessToken: 'access-k',
    })
    const { result } = renderHook(() => useKakaoLogin(), { wrapper: createQueryWrapper() })

    result.current.mutate('existing')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAuthStore.getState().accessToken).toBe('access-k')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('신규회원_시_프로필들고_소셜가입이동', async () => {
    const profile = { kakaoId: 'k1', email: 'k@kakao.com', nickname: '카카오사용자' }
    vi.mocked(authApi.kakaoAuthorize).mockResolvedValue({ status: 'new', profile })
    const { result } = renderHook(() => useKakaoLogin(), { wrapper: createQueryWrapper() })

    result.current.mutate('new_email')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // 신규는 토큰 미발급 (추가정보 입력 후 발급) — PublicOnlyRoute 가로채기 회피
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(mockNavigate).toHaveBeenCalledWith('/signup/social', { state: { profile } })
  })

  it('이메일거부_시_KAKAO_EMAIL_REQUIRED_토큰미저장_네비없음', async () => {
    vi.mocked(authApi.kakaoAuthorize).mockRejectedValue(
      new ApiError(400, 'KAKAO_EMAIL_REQUIRED', '카카오 이메일 제공에 동의해야 가입할 수 있어요'),
    )
    const { result } = renderHook(() => useKakaoLogin(), { wrapper: createQueryWrapper() })

    result.current.mutate('new_no_email')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as ApiError).code).toBe('KAKAO_EMAIL_REQUIRED')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('이메일충돌_시_EMAIL_ALREADY_REGISTERED', async () => {
    vi.mocked(authApi.kakaoAuthorize).mockRejectedValue(
      new ApiError(409, 'EMAIL_ALREADY_REGISTERED', '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요'),
    )
    const { result } = renderHook(() => useKakaoLogin(), { wrapper: createQueryWrapper() })

    result.current.mutate('email_conflict')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as ApiError).code).toBe('EMAIL_ALREADY_REGISTERED')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
