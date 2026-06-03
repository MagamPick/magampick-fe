import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePhoneVerification } from './usePhoneVerification'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/authApi')

describe('usePhoneVerification', () => {
  beforeEach(() => vi.clearAllMocks())

  it('인증번호_확인_성공_시_verificationToken_반환', async () => {
    vi.mocked(authApi.verifyPhoneCode).mockResolvedValue({ verificationToken: 'mock-verification-token' })
    const { result } = renderHook(() => usePhoneVerification(), { wrapper: createQueryWrapper() })

    result.current.verify.mutate({ phone: '010-1234-5678', code: '000000' })

    await waitFor(() => expect(result.current.verify.isSuccess).toBe(true))
    expect(result.current.verify.data?.verificationToken).toBe('mock-verification-token')
  })

  it('인증번호_불일치_시_에러', async () => {
    vi.mocked(authApi.verifyPhoneCode).mockRejectedValue(
      new ApiError(400, 'PHONE_VERIFICATION_FAILED', '인증번호가 일치하지 않습니다'),
    )
    const { result } = renderHook(() => usePhoneVerification(), { wrapper: createQueryWrapper() })

    result.current.verify.mutate({ phone: '010-1234-5678', code: '111111' })

    await waitFor(() => expect(result.current.verify.isError).toBe(true))
  })
})
