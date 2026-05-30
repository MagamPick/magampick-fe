import { ApiError } from '@/shared/lib/apiError'
import type { SignupInput } from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 회원가입 API(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Mock: 이 이메일만 중복으로 취급 */
const TAKEN_EMAIL = 'taken@magampick.com'
/** Mock: 본인인증 통과 코드 (auth.md §11) */
const MOCK_OTP = '000000'

export const authApi = {
  async checkEmail(email: string): Promise<{ available: boolean }> {
    await delay(500)
    if (email === TAKEN_EMAIL) {
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다')
    }
    return { available: true }
  },

  async requestPhoneVerification(phone: string): Promise<void> {
    await delay(500)
    if (!phone) {
      throw new ApiError(400, 'INVALID_INPUT', '휴대폰 번호를 입력해주세요')
    }
    // Mock: 실제 SMS 발송 안 함 (코드 000000 으로 통과)
  },

  async verifyPhoneCode(input: {
    phone: string
    code: string
  }): Promise<{ verificationToken: string }> {
    await delay(500)
    if (input.code !== MOCK_OTP) {
      throw new ApiError(400, 'PHONE_VERIFICATION_FAILED', '인증번호가 일치하지 않습니다')
    }
    return { verificationToken: 'mock-verification-token' }
  },

  async signup(input: SignupInput): Promise<{ accessToken: string }> {
    await delay(800)
    // Mock: 실제로는 input 으로 customers row + 약관 동의 + 기본 주소 생성. 여기선 토큰만 발급.
    return { accessToken: `mock-access-token:${input.email}` }
  },
}
