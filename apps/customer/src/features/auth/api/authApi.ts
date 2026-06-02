import { ApiError } from '@/shared/lib/apiError'
import { passwordSchema, PASSWORD_RESET_ERROR } from '../types'
import type {
  SignupInput,
  LoginInput,
  KakaoScenario,
  KakaoAuthorizeResult,
  SocialSignupInput,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 인증 API(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Mock: 이 이메일만 중복으로 취급 */
const TAKEN_EMAIL = 'taken@magampick.com'
/** Mock: 본인인증 통과 코드 (auth.md §11) */
const MOCK_OTP = '000000'
/** Mock: 이 이메일만 로그인 실패로 취급 (그 외 임의 이메일 + 규칙 충족 PW 는 성공) */
const WRONG_CREDENTIAL_EMAIL = 'wrong@magampick.com'
/** Mock: 카카오 사용자 정보 (실연동 시 카카오 user-info 조회 결과로 교체) */
const MOCK_KAKAO_PROFILE = {
  kakaoId: 'kakao_1029384756',
  email: 'kakao.user@kakao.com',
  nickname: '카카오사용자',
}

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

  async login(input: LoginInput): Promise<{ accessToken: string }> {
    await delay(700)
    if (input.email === WRONG_CREDENTIAL_EMAIL) {
      // 실패 메시지는 이메일 존재 여부와 무관하게 동일 (계정 존재 노출 차단 — auth.md §4)
      throw new ApiError(401, 'LOGIN_FAILED', '이메일 또는 비밀번호가 일치하지 않습니다')
    }
    // Mock: 실제로는 서버가 bcrypt 검증 후 access(body) + refresh(HttpOnly cookie) 발급. 여기선 access 만.
    return { accessToken: `mock-access-token:${input.email}` }
  },

  async logout(): Promise<void> {
    await delay(300)
    // Mock: 실제로는 서버가 Redis refresh 키 삭제 + clear cookie (auth.md §7).
  },

  /**
   * Mock: "카카오 OAuth 왕복 + BE 콜백" 시뮬. 실연동 시 콜백의 ?code 를 BE 로 보내 교환하는 호출로 교체.
   * (실제 카카오 로그인·동의 화면은 카카오 호스팅 — FE 가 그리지 않음. 소셜 로그인 명세 참조.)
   */
  async kakaoAuthorize(scenario: KakaoScenario): Promise<KakaoAuthorizeResult> {
    await delay(700)
    switch (scenario) {
      case 'existing':
        // 기존 매핑된 카카오 ID → 바로 access 발급 (refresh 는 서버가 HttpOnly cookie)
        return { status: 'existing', accessToken: `mock-access-token:${MOCK_KAKAO_PROFILE.email}` }
      case 'new_email':
        // 신규 + 이메일 동의 O → 추가정보용 프로필 (닉네임 받았으면 prefill)
        return { status: 'new', profile: { ...MOCK_KAKAO_PROFILE } }
      case 'new_no_email':
        // 이메일 동의 거부 → 우리 시스템 필수라 가입 차단 (클라이언트가 재동의 유도)
        throw new ApiError(400, 'KAKAO_EMAIL_REQUIRED', '카카오 이메일 제공에 동의해야 가입할 수 있어요')
      case 'email_conflict':
        // 카카오 이메일이 일반 가입 이메일과 충돌 → 자동 연결 X (도용 방지)
        throw new ApiError(
          409,
          'EMAIL_ALREADY_REGISTERED',
          '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요',
        )
      default:
        throw new ApiError(400, 'SOCIAL_AUTH_FAILED', '카카오 로그인에 실패했어요')
    }
  },

  async socialSignup(input: SocialSignupInput): Promise<{ accessToken: string }> {
    await delay(800)
    // Mock: 실제로는 customers(password_hash NULL) + customer_oauth_accounts + 약관 + 주소 한 트랜잭션.
    return { accessToken: `mock-access-token:${input.email}` }
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
}
