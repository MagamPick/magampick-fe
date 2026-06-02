import { describe, it, expect } from 'vitest'
import { authApi } from './authApi'
import { PASSWORD_RESET_ERROR } from '../types'

/**
 * 비밀번호 재설정 mock — 이메일↔휴대폰 매칭 + 새 비번 정책. 사장은 소셜 가입이 없어 SOCIAL_ONLY 케이스 없음.
 * (회원가입·로그인 mock 은 기존 훅 테스트가 커버 — 여기선 재설정 신규 함수만)
 */
describe('authApi 비밀번호 재설정 (mock)', () => {
  const TOKEN = 'mock-verification-token'

  describe('verifyPasswordResetIdentity', () => {
    it('등록 계정의 이메일+휴대폰이 일치하면 resetToken 을 발급한다', async () => {
      const res = await authApi.verifyPasswordResetIdentity({
        email: 'demo@magampick.com',
        phone: '010-1234-5678',
        verificationToken: TOKEN,
      })
      expect(res.resetToken).toBeTruthy()
    })

    it('본인인증 토큰이 없으면 PHONE_VERIFICATION_REQUIRED', async () => {
      await expect(
        authApi.verifyPasswordResetIdentity({
          email: 'demo@magampick.com',
          phone: '010-1234-5678',
          verificationToken: '',
        }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.PHONE_VERIFICATION_REQUIRED })
    })

    it('등록되지 않은 이메일은 RESET_VERIFICATION_FAILED (존재 여부 비노출)', async () => {
      await expect(
        authApi.verifyPasswordResetIdentity({
          email: 'nobody@magampick.com',
          phone: '010-1234-5678',
          verificationToken: TOKEN,
        }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED })
    })

    it('이메일은 있지만 휴대폰이 다르면 RESET_VERIFICATION_FAILED', async () => {
      await expect(
        authApi.verifyPasswordResetIdentity({
          email: 'demo@magampick.com',
          phone: '010-0000-0000',
          verificationToken: TOKEN,
        }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED })
    })
  })

  describe('resetPassword', () => {
    const resetToken = 'mock-reset-token:demo@magampick.com'

    it('정책을 충족하는 새 비밀번호면 성공한다', async () => {
      await expect(
        authApi.resetPassword({ resetToken, newPassword: 'abcd1234!' }),
      ).resolves.toBeUndefined()
    })

    it('정책 미충족(약한 비번)이면 PASSWORD_POLICY_VIOLATION', async () => {
      await expect(
        authApi.resetPassword({ resetToken, newPassword: 'weak' }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.PASSWORD_POLICY_VIOLATION })
    })

    it('resetToken 이 없으면 PHONE_VERIFICATION_REQUIRED', async () => {
      await expect(
        authApi.resetPassword({ resetToken: '', newPassword: 'abcd1234!' }),
      ).rejects.toMatchObject({ code: PASSWORD_RESET_ERROR.PHONE_VERIFICATION_REQUIRED })
    })
  })
})
