import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePasswordReset } from './usePasswordReset'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { PASSWORD_RESET_ERROR } from '../types'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/authApi')

describe('usePasswordReset', () => {
  beforeEach(() => vi.clearAllMocks())

  it('본인확인_성공_시_resetToken_을_반환한다', async () => {
    vi.mocked(authApi.verifyPasswordResetIdentity).mockResolvedValue({ resetToken: 'reset-token' })
    const { result } = renderHook(() => usePasswordReset(), { wrapper: createQueryWrapper() })

    result.current.verifyIdentity.mutate({
      email: 'demo@magampick.com',
      phone: '010-1234-5678',
      verificationToken: 'mock-verification-token',
    })

    await waitFor(() => expect(result.current.verifyIdentity.isSuccess).toBe(true))
    expect(result.current.verifyIdentity.data?.resetToken).toBe('reset-token')
  })

  it('소셜_전용_계정이면_SOCIAL_ONLY_ACCOUNT_에러를_전파한다', async () => {
    vi.mocked(authApi.verifyPasswordResetIdentity).mockRejectedValue(
      new ApiError(409, PASSWORD_RESET_ERROR.SOCIAL_ONLY_ACCOUNT, '카카오로 로그인해 주세요'),
    )
    const { result } = renderHook(() => usePasswordReset(), { wrapper: createQueryWrapper() })

    result.current.verifyIdentity.mutate({
      email: 'kakao.user@kakao.com',
      phone: '010-2222-3333',
      verificationToken: 'mock-verification-token',
    })

    await waitFor(() => expect(result.current.verifyIdentity.isError).toBe(true))
    expect((result.current.verifyIdentity.error as ApiError).code).toBe(
      PASSWORD_RESET_ERROR.SOCIAL_ONLY_ACCOUNT,
    )
  })

  it('새_비밀번호_저장에_성공한다', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValue(undefined)
    const { result } = renderHook(() => usePasswordReset(), { wrapper: createQueryWrapper() })

    result.current.resetPassword.mutate({ resetToken: 'reset-token', newPassword: 'abcd1234!' })

    await waitFor(() => expect(result.current.resetPassword.isSuccess).toBe(true))
  })
})
