import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { authApi } from './authApi'
import { ApiError } from '@/shared/lib/apiError'
import { PASSWORD_RESET_ERROR, PASSWORD_CHANGE_ERROR } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

/**
 * 비밀번호 재설정 실연동 — POST /auth/password-resets/verify-identity + /confirm
 */
describe('authApi 비밀번호 재설정 (실연동)', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('verifyPasswordResetIdentity', () => {
    it('올바른 엔드포인트·body를 호출하고 resetToken을 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { resetToken: 'real-reset-token' } })

      const res = await authApi.verifyPasswordResetIdentity({
        email: 'demo@magampick.com',
        phone: '010-1234-5678',
        verificationToken: 'mock-verification-token',
      })

      expect(res.resetToken).toBe('real-reset-token')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/password-resets/verify-identity', {
        email: 'demo@magampick.com',
        phone: '010-1234-5678',
        verificationToken: 'mock-verification-token',
      })
    })

    it('BE가 RESET_VERIFICATION_FAILED를 반환하면 ApiError를 전파한다', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(
        new ApiError(
          404,
          PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED,
          '입력하신 정보와 일치하는 계정을 찾을 수 없어요',
        ),
      )

      await expect(
        authApi.verifyPasswordResetIdentity({
          email: 'nobody@magampick.com',
          phone: '010-1234-5678',
          verificationToken: 'mock-verification-token',
        }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED })
    })

    it('BE가 SOCIAL_ONLY_ACCOUNT를 반환하면 ApiError를 전파한다', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(
        new ApiError(
          409,
          PASSWORD_RESET_ERROR.SOCIAL_ONLY_ACCOUNT,
          '카카오로 가입한 계정이에요. 카카오로 로그인해 주세요',
        ),
      )

      await expect(
        authApi.verifyPasswordResetIdentity({
          email: 'kakao.user@kakao.com',
          phone: '010-2222-3333',
          verificationToken: 'mock-verification-token',
        }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.SOCIAL_ONLY_ACCOUNT })
    })
  })

  describe('resetPassword', () => {
    it('올바른 엔드포인트·body를 호출하고 void를 반환한다 (204 No Content)', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

      await expect(
        authApi.resetPassword({ resetToken: 'real-reset-token', newPassword: 'abcd1234!' }),
      ).resolves.toBeUndefined()

      expect(apiClient.post).toHaveBeenCalledWith('/auth/password-resets/confirm', {
        resetToken: 'real-reset-token',
        newPassword: 'abcd1234!',
      })
    })

    it('BE가 토큰 만료를 반환하면 ApiError를 전파한다', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(
        new ApiError(400, PASSWORD_RESET_ERROR.PHONE_VERIFICATION_REQUIRED, '토큰이 만료되었습니다'),
      )

      await expect(
        authApi.resetPassword({ resetToken: 'expired-token', newPassword: 'abcd1234!' }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.PHONE_VERIFICATION_REQUIRED })
    })
  })
})

/**
 * 비밀번호 변경 (로그인 상태) mock — 현재 비번 검증 + 새 비번 정책.
 * 성공 시 현재 기기 세션 유지(자동 로그아웃 X — 노션 「비밀번호 변경」 명세).
 */
describe('authApi 비밀번호 변경 (mock)', () => {
  it('현재 비번이 맞고 새 비번이 정책을 충족하면 성공한다', async () => {
    await expect(
      authApi.changePassword({ currentPassword: 'Magampick1!', newPassword: 'abcd1234!' }),
    ).resolves.toBeUndefined()
  })

  it('현재 비번이 틀리면 CURRENT_PASSWORD_MISMATCH', async () => {
    await expect(
      authApi.changePassword({ currentPassword: 'wrongpass1!', newPassword: 'abcd1234!' }),
    ).rejects.toMatchObject({ code: PASSWORD_CHANGE_ERROR.CURRENT_PASSWORD_MISMATCH })
  })

  it('새 비번이 정책 미충족이면 PASSWORD_POLICY_VIOLATION', async () => {
    await expect(
      authApi.changePassword({ currentPassword: 'Magampick1!', newPassword: 'weak' }),
    ).rejects.toMatchObject({ code: PASSWORD_CHANGE_ERROR.PASSWORD_POLICY_VIOLATION })
  })
})
