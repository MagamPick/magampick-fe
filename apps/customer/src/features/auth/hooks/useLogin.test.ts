import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogin } from './useLogin'
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

const credentials = { email: 'user@magampick.com', password: 'abcd1234!', keepSignedIn: true }

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('로그인_성공_시_토큰저장_홈이동', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'access-123' })
    const { result } = renderHook(() => useLogin(), { wrapper: createQueryWrapper() })

    result.current.mutate(credentials)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAuthStore.getState().accessToken).toBe('access-123')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('로그인_실패_시_LOGIN_FAILED_에러_토큰미저장', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(401, 'LOGIN_FAILED', '이메일 또는 비밀번호가 일치하지 않습니다'),
    )
    const { result } = renderHook(() => useLogin(), { wrapper: createQueryWrapper() })

    result.current.mutate({ ...credentials, email: 'wrong@magampick.com' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as ApiError).code).toBe('LOGIN_FAILED')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
