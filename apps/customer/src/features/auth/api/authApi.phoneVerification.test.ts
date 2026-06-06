import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { authApi } from './authApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

describe('authApi 휴대폰 본인인증', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증번호_발송_API를_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await expect(authApi.requestPhoneVerification('010-1234-5678')).resolves.toBeUndefined()

    expect(apiClient.post).toHaveBeenCalledWith('/auth/phone-verifications', {
      phone: '010-1234-5678',
    })
  })

  it('인증번호_확인_API를_호출하고_verificationToken을_반환한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { verificationToken: 'phone-verification-token' },
    })

    await expect(
      authApi.verifyPhoneCode({ phone: '010-1234-5678', code: '123456' }),
    ).resolves.toEqual({ verificationToken: 'phone-verification-token' })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/phone-verifications/confirm', {
      phone: '010-1234-5678',
      code: '123456',
    })
  })
})
