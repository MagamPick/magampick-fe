import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import {
  termsSchema,
  tokenResponseSchema,
  phoneVerificationTokenResponseSchema,
  emailAvailabilityResponseSchema,
} from '../types'
import type { LoginInput, SignupTerm, SellerSignupPayload } from '../types'

/** 비밀번호 재설정 본인확인 응답 (resetToken 발급) */
const resetTokenResponseSchema = z.object({ resetToken: z.string() })

export const authApi = {
  /** GET /terms?role=SELLER — 사장 약관 목록 (id 포함, 가입 Step 1) */
  async listTerms(): Promise<SignupTerm[]> {
    const res = await apiClient.get('/terms', { params: { role: 'SELLER' } })
    return termsSchema.parse(res.data)
  },

  /** GET /auth/email-availability?role=SELLER — 이메일 중복 확인 (중복은 BE 409 → ApiError) */
  async checkEmail(email: string): Promise<{ available: boolean }> {
    const res = await apiClient.get('/auth/email-availability', {
      params: { role: 'SELLER', email },
    })
    return emailAvailabilityResponseSchema.parse(res.data)
  },

  /** POST /auth/phone-verifications — 휴대폰 6자리 SMS 인증번호 발송 */
  async requestPhoneVerification(phone: string): Promise<void> {
    await apiClient.post('/auth/phone-verifications', { phone })
  },

  /** POST /auth/phone-verifications/confirm — 인증번호 검증 → 본인인증 토큰(15분) */
  async verifyPhoneCode(input: {
    phone: string
    code: string
  }): Promise<{ verificationToken: string }> {
    const res = await apiClient.post('/auth/phone-verifications/confirm', input)
    return phoneVerificationTokenResponseSchema.parse(res.data)
  },

  /**
   * POST /auth/seller/stores/business-verification — 가입 흐름 사업자 진위확인 (204 No Content).
   * 사업자번호·대표자명·개업일자 3요소를 국세청 조회. 통과 시 resolve, 불일치/형식오류는 ApiError.
   */
  async checkBusinessNumber(input: {
    businessNumber: string
    representativeName: string
    openDate: string
  }): Promise<void> {
    await apiClient.post('/auth/seller/stores/business-verification', input)
  },

  /**
   * POST /auth/seller/signup — 사장 회원가입 (multipart/form-data).
   * `request` JSON 파트 + 선택 `image` 파일 파트. 한 트랜잭션으로 sellers + 약관동의 + 첫 매장 생성 후 자동 로그인.
   * Content-Type 을 multipart 로 명시해야 axios 가 FormData 를 JSON 으로 변환하지 않고 boundary 를 붙인다.
   */
  async signup(payload: SellerSignupPayload, imageFile?: File): Promise<{ accessToken: string }> {
    const form = new FormData()
    form.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    if (imageFile) {
      form.append('image', imageFile)
    }
    const res = await apiClient.post('/auth/seller/signup', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return tokenResponseSchema.parse(res.data)
  },

  /**
   * POST /auth/seller/login — 사장 로그인 (access 바디 + refresh HttpOnly 쿠키).
   * 사장 앱은 로그인 상태 유지 토글이 없어 항상 keepSignedIn:true (auth.md §6).
   */
  async login(input: LoginInput): Promise<{ accessToken: string }> {
    const res = await apiClient.post('/auth/seller/login', { ...input, keepSignedIn: true })
    return tokenResponseSchema.parse(res.data)
  },

  /** POST /auth/logout — Redis refresh 삭제 + clear cookie */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  /**
   * POST /auth/seller/password-resets/verify-identity — 이메일↔휴대폰 매칭 후 resetToken 발급.
   * 존재 비노출·본인인증 등 정책 판정은 BE. 실패는 ApiError(코드는 PASSWORD_RESET_ERROR 와 매칭).
   */
  async verifyPasswordResetIdentity(input: {
    email: string
    phone: string
    verificationToken: string
  }): Promise<{ resetToken: string }> {
    const res = await apiClient.post('/auth/seller/password-resets/verify-identity', input)
    return resetTokenResponseSchema.parse(res.data)
  },

  /** POST /auth/password-resets/confirm — resetToken 으로 새 비밀번호 저장 (전 기기 refresh 폐기) */
  async resetPassword(input: { resetToken: string; newPassword: string }): Promise<void> {
    await apiClient.post('/auth/password-resets/confirm', input)
  },

  /** PATCH /auth/me/password — 비밀번호 변경 (로그인 상태, 현재 기기 세션 유지) */
  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.patch('/auth/me/password', input)
  },
}
