import { ApiError } from '@/shared/lib/apiError'
import { apiClient } from '@/shared/lib/axios'
import {
  kakaoExchangeResultSchema,
  tokenResponseSchema,
  termsSchema,
  phoneVerificationTokenResponseSchema,
  emailAvailabilityResponseSchema,
  passwordResetVerifyResponseSchema,
} from '../types'
import type {
  SignupInput,
  LoginInput,
  KakaoExchangeResult,
  SocialSignupInput,
  SignupTerm,
} from '../types'

export const authApi = {
  async listTerms(): Promise<SignupTerm[]> {
    const res = await apiClient.get('/terms')
    return termsSchema.parse(res.data)
  },

  async checkEmail(email: string): Promise<{ available: boolean }> {
    const res = await apiClient.get('/auth/email-availability', {
      params: { role: 'CUSTOMER', email },
    })
    return emailAvailabilityResponseSchema.parse(res.data)
  },

  async requestPhoneVerification(phone: string): Promise<void> {
    await apiClient.post('/auth/phone-verifications', { phone })
  },

  async verifyPhoneCode(input: {
    phone: string
    code: string
  }): Promise<{ verificationToken: string }> {
    const res = await apiClient.post('/auth/phone-verifications/confirm', input)
    return phoneVerificationTokenResponseSchema.parse(res.data)
  },

  async signup(input: SignupInput): Promise<{ accessToken: string }> {
    if (!input.address) {
      throw new ApiError(400, 'DEFAULT_ADDRESS_REQUIRED', '기본 주소를 등록해주세요')
    }
    const res = await apiClient.post('/auth/signup', {
      email: input.email,
      password: input.password,
      nickname: input.nickname,
      phone: input.phone,
      verificationToken: input.verificationToken,
      agreedTermIds: input.agreedTermIds,
      address: input.address,
    })
    return tokenResponseSchema.parse(res.data)
  },

  async login(input: LoginInput): Promise<{ accessToken: string }> {
    const res = await apiClient.post('/auth/login', {
      email: input.email,
      password: input.password,
      keepSignedIn: input.keepSignedIn,
    })
    return tokenResponseSchema.parse(res.data)
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshAccessToken(): Promise<{ accessToken: string }> {
    const res = await apiClient.post('/auth/refresh')
    return tokenResponseSchema.parse(res.data)
  },

  /**
   * 카카오 인가코드 교환 (실 BE 호출 — 소셜 로그인 계약 step1).
   * 콜백이 받은 ?code 와 ①인가요청에 쓴 redirectUri 를 보내 access(EXISTING) 또는 socialToken(NEW)을 받는다.
   * HTTP 에러는 apiClient 인터셉터가 ApiError 로 정규화해 reject, 응답 형상은 Zod 로 검증.
   */
  async exchangeKakaoCode(input: {
    authorizationCode: string
    redirectUri: string
  }): Promise<KakaoExchangeResult> {
    const res = await apiClient.post('/auth/kakao', {
      authorizationCode: input.authorizationCode,
      redirectUri: input.redirectUri,
    })
    return kakaoExchangeResultSchema.parse(res.data)
  },

  async socialSignup(input: SocialSignupInput): Promise<{ accessToken: string }> {
    const res = await apiClient.post('/auth/signup/social', {
      socialToken: input.socialToken,
      nickname: input.nickname,
      phone: input.phone,
      verificationToken: input.verificationToken,
      agreedTermIds: input.agreedTermIds,
      address: input.address,
    })
    return tokenResponseSchema.parse(res.data)
  },

  /**
   * 비밀번호 재설정 Step 2→3 게이트 — 이메일↔휴대폰 매칭 + 소셜전용 차단 후 resetToken 발급.
   * 존재 비노출: 이메일 미등록·휴대폰 불일치 모두 동일 RESET_VERIFICATION_FAILED (노션 AC).
   * BE 가 verificationToken 의 휴대폰 일치 검증 + 계정 조회 후 resetToken 발급.
   */
  async verifyPasswordResetIdentity(input: {
    email: string
    phone: string
    verificationToken: string
  }): Promise<{ resetToken: string }> {
    const res = await apiClient.post('/auth/password-resets/verify-identity', {
      email: input.email,
      phone: input.phone,
      verificationToken: input.verificationToken,
    })
    return passwordResetVerifyResponseSchema.parse(res.data)
  },

  /**
   * 새 비밀번호 저장 — BE 가 비번 해시 업데이트 + 해당 계정 Redis refresh 키 일괄 삭제
   * (모든 기기 강제 로그아웃, 자동 로그인 X — 노션 명세). 204 No Content.
   */
  async resetPassword(input: { resetToken: string; newPassword: string }): Promise<void> {
    await apiClient.post('/auth/password-resets/confirm', {
      resetToken: input.resetToken,
      newPassword: input.newPassword,
    })
  },

  /** PATCH /auth/me/password — 비밀번호 변경 (로그인 상태, 현재 기기 세션 유지) */
  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.patch('/auth/me/password', input)
  },
}
