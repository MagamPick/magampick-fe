import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/**
 * 비밀번호 재설정 — 이메일↔휴대폰 매칭(resetToken 발급) + 새 비밀번호 저장.
 * OTP 발송/검증은 usePhoneVerification 재사용. 스텝 전환·resetToken 보관은 페이지 로컬.
 */
export function usePasswordReset() {
  const verifyIdentity = useMutation({
    mutationFn: (input: { email: string; phone: string; verificationToken: string }) =>
      authApi.verifyPasswordResetIdentity(input),
  })
  const resetPassword = useMutation({
    mutationFn: (input: { resetToken: string; newPassword: string }) =>
      authApi.resetPassword(input),
  })
  return { verifyIdentity, resetPassword }
}
