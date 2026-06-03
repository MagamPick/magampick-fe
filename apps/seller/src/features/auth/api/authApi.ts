import { ApiError } from '@/shared/lib/apiError'
import { passwordSchema, PASSWORD_RESET_ERROR, PASSWORD_CHANGE_ERROR } from '../types'
import type { SignupInput, LoginInput } from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 사장 인증 API(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Mock: 이 이메일만 중복으로 취급 */
const TAKEN_EMAIL = 'taken@magampick.com'
/** Mock: 본인인증 통과 코드 (auth.md §11) */
const MOCK_OTP = '000000'
/** Mock: 이 이메일만 로그인 실패로 취급 (그 외 임의 이메일 + 입력된 PW 는 성공) */
const WRONG_CREDENTIAL_EMAIL = 'wrong@magampick.com'
/** Mock: 로그인 사용자의 현재 비밀번호 (실연동 시 BE 가 세션 사용자 해시로 검증) */
const MOCK_CURRENT_PASSWORD = 'Magampick1!'

/**
 * Mock: 비밀번호 재설정 매칭용 등록 사장 계정 (이메일+휴대폰 쌍). 휴대폰 unique X 라 쌍으로만 식별.
 * 사장은 소셜 가입이 없어 socialOnly 계정 없음. 실연동 시 BE 가 sellers 조회로 대체.
 */
const RESET_ACCOUNTS: { email: string; phone: string; socialOnly: boolean }[] = [
  { email: 'demo@magampick.com', phone: '010-1234-5678', socialOnly: false },
]

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
    // Mock: 실제 SMS 발송 안 함 (코드 000000 으로 통과) — ADR-001 SOLAPI 연동 PR 에서 교체
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

  /**
   * 사업자등록번호 조회 — Mock(프로토타입 owner-v3 규칙): 앞 3자리 '000' 이면 실패.
   * 실연동 시 국세청 사업자등록 상태조회 API 로 교체 (디테일 → 매장 등록 신청).
   */
  async checkBusinessNumber(input: {
    businessNumber: string
    representativeName: string
    openDate: string
  }): Promise<{ verified: true }> {
    await delay(600)
    const digits = input.businessNumber.replace(/\D/g, '')
    // 국세청 사업자등록 진위확인은 (사업자번호 + 대표자명 + 개업일자) 3요소 필수
    if (digits.length !== 10 || !input.representativeName.trim() || !input.openDate) {
      throw new ApiError(400, 'INVALID_INPUT', '사업자번호·대표자명·개업일자를 모두 입력해주세요')
    }
    if (digits.slice(0, 3) === '000') {
      throw new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다')
    }
    return { verified: true }
  },

  async signup(input: SignupInput): Promise<{ accessToken: string }> {
    await delay(800)
    // Mock: 실제로는 한 트랜잭션으로 sellers + 약관 동의 + stores 생성. 여기선 토큰만 발급.
    return { accessToken: `mock-access-token:${input.email}` }
  },

  async login(input: LoginInput): Promise<{ accessToken: string }> {
    await delay(700)
    if (input.email === WRONG_CREDENTIAL_EMAIL) {
      // 실패 메시지는 이메일 존재 여부와 무관하게 동일 (계정 존재 노출 차단 — auth.md §4)
      throw new ApiError(401, 'LOGIN_FAILED', '이메일 또는 비밀번호가 일치하지 않습니다')
    }
    // Mock: 실제로는 서버가 bcrypt 검증 후 access(body) + refresh(HttpOnly cookie) 발급. 여기선 access 만.
    // 사장 앱은 로그인 상태 유지 토글이 없어 항상 keepSignedIn:true (auth.md §4·§6) — 연동 PR 에서 body 에 추가.
    return { accessToken: `mock-access-token:${input.email}` }
  },

  async logout(): Promise<void> {
    await delay(300)
    // Mock: 실제로는 서버가 Redis refresh 키 삭제 + clear cookie (auth.md §7).
  },

  /**
   * 비밀번호 재설정 Step 2→3 게이트 — 이메일↔휴대폰 매칭 후 resetToken 발급.
   * 존재 비노출: 이메일 미등록·휴대폰 불일치 모두 동일 RESET_VERIFICATION_FAILED (노션 AC).
   * (사장은 소셜 가입이 없어 SOCIAL_ONLY_ACCOUNT 는 발생하지 않지만 방어용으로 분기 유지)
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
        '소셜 계정은 비밀번호 재설정을 사용할 수 없어요',
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
