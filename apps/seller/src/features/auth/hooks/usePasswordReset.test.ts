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

  it('매칭_실패_시_RESET_VERIFICATION_FAILED_에러를_전파한다', async () => {
    vi.mocked(authApi.verifyPasswordResetIdentity).mockRejectedValue(
      new ApiError(404, PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED, '계정을 찾을 수 없어요'),
    )
    const { result } = renderHook(() => usePasswordReset(), { wrapper: createQueryWrapper() })

    result.current.verifyIdentity.mutate({
      email: 'nobody@magampick.com',
      phone: '010-1234-5678',
      verificationToken: 'mock-verification-token',
    })

    await waitFor(() => expect(result.current.verifyIdentity.isError).toBe(true))
    expect((result.current.verifyIdentity.error as ApiError).code).toBe(
      PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED,
    )
  })

  it('새_비밀번호_저장에_성공한다', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValue(undefined)
    const { result } = renderHook(() => usePasswordReset(), { wrapper: createQueryWrapper() })

    result.current.resetPassword.mutate({ resetToken: 'reset-token', newPassword: 'abcd1234!' })

    await waitFor(() => expect(result.current.resetPassword.isSuccess).toBe(true))
  })
})
