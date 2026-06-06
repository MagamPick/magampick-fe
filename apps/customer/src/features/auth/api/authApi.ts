import { ApiError } from '@/shared/lib/apiError'
import { apiClient } from '@/shared/lib/axios'
import {
  passwordSchema,
  PASSWORD_RESET_ERROR,
  PASSWORD_CHANGE_ERROR,
  kakaoExchangeResultSchema,
  tokenResponseSchema,
  termsSchema,
  phoneVerificationTokenResponseSchema,
  emailAvailabilityResponseSchema,
} from '../types'
import type {
  SignupInput,
  LoginInput,
  KakaoExchangeResult,
  SocialSignupInput,
  SignupTerm,
} from '../types'

/** Mock 잔여 API 는 후속 인증 연동 PR 에서 실제 호출로 교체. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Mock: 로그인 사용자의 현재 비밀번호 (실연동 시 BE 가 세션 사용자 해시로 검증) */
const MOCK_CURRENT_PASSWORD = 'Magampick1!'

/**
 * Mock: 비밀번호 재설정 매칭용 등록 계정 (이메일+휴대폰 쌍). 휴대폰 unique X 라 쌍으로만 식별.
 * 실연동 시 BE 가 customers/sellers 조회 + verificationToken 의 휴대폰 일치 검증으로 대체.
 * socialOnly = 카카오 가입(password_hash NULL) — 매칭은 되지만 비번 재설정 불가.
 */
const RESET_ACCOUNTS: { email: string; phone: string; socialOnly: boolean }[] = [
  { email: 'demo@magampick.com', phone: '010-1234-5678', socialOnly: false },
  { email: 'kakao.user@kakao.com', phone: '010-2222-3333', socialOnly: true },
]

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
   * Mock: 실연동 시 verificationToken 의 휴대폰 일치 검증 + 계정 조회로 교체.
   */
  async verifyPasswordResetIdentity(input: {
    email: string
    phone: string
    verificationToken: string
  }): Promise<{ resetToken: string }> {
    await delay(600)
    if (!input.verificationToken) {
      throw new ApiError(
        400,
        PASSWORD_RESET_ERROR.PHONE_VERIFICATION_REQUIRED,
        '휴대폰 본인인증이 필요합니다',
      )
    }
    const account = RESET_ACCOUNTS.find((a) => a.email === input.email && a.phone === input.phone)
    if (!account) {
      throw new ApiError(
        404,
        PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED,
        '입력하신 정보와 일치하는 계정을 찾을 수 없어요',
      )
    }
    if (account.socialOnly) {
      throw new ApiError(
        409,
        PASSWORD_RESET_ERROR.SOCIAL_ONLY_ACCOUNT,
        '카카오로 가입한 계정이에요. 카카오로 로그인해 주세요',
      )
    }
    return { resetToken: `mock-reset-token:${input.email}` }
  },

  /**
   * 새 비밀번호 저장 — Mock: 실연동 시 비번 해시 업데이트 + 해당 계정 Redis refresh 키 일괄 삭제
   * (모든 기기 강제 로그아웃, 자동 로그인 X — 노션 명세). 여기선 정책 검증 후 resolve.
   */
  async resetPassword(input: { resetToken: string; newPassword: string }): Promise<void> {
    await delay(700)
    if (!input.resetToken) {
      throw new ApiError(
        400,
        PASSWORD_RESET_ERROR.PHONE_VERIFICATION_REQUIRED,
        '본인인증이 필요합니다',
      )
    }
    if (!passwordSchema.safeParse(input.newPassword).success) {
      throw new ApiError(
        400,
        PASSWORD_RESET_ERROR.PASSWORD_POLICY_VIOLATION,
        '비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다',
      )
    }
    // Mock: 실제 갱신 없음
  },

  /**
   * 비밀번호 변경 (로그인 상태) — Mock: 현재 비번 검증 후 갱신.
   * 실연동 시 세션 사용자의 비번 해시 검증 + 해시 업데이트 + 다른 기기 refresh 키 삭제(현재 기기 유지).
   * 현재 기기 세션 유지 — 자동 로그아웃 X (노션 「비밀번호 변경」 명세).
   */
  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await delay(700)
    if (input.currentPassword !== MOCK_CURRENT_PASSWORD) {
      throw new ApiError(
        400,
        PASSWORD_CHANGE_ERROR.CURRENT_PASSWORD_MISMATCH,
        '현재 비밀번호가 일치하지 않습니다',
      )
    }
    if (!passwordSchema.safeParse(input.newPassword).success) {
      throw new ApiError(
        400,
        PASSWORD_CHANGE_ERROR.PASSWORD_POLICY_VIOLATION,
        '비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다',
      )
    }
    // Mock: 실제 갱신 없음 (현재 기기 세션 유지)
  },
}
