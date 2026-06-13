import { z } from 'zod'

/** 비밀번호 룰 (auth.md §8) — 로그인/가입/변경/재설정 공유 */
export const passwordSchema = z
  .string()
  .min(8, '8자 이상이어야 합니다')
  .regex(/[A-Za-z]/, '영문을 포함해야 합니다')
  .regex(/\d/, '숫자를 포함해야 합니다')
  .regex(/[^A-Za-z\d]/, '특수문자를 포함해야 합니다')

/** 약관 type (노션 결정 2026-05-29: 5종 통일 term type) */
export const TERM_IDS = ['AGE_14', 'TERMS_OF_SERVICE', 'PRIVACY', 'LOCATION', 'MARKETING'] as const
export type TermId = (typeof TERM_IDS)[number]

export const termSchema = z.object({
  id: z.number(),
  type: z.enum(TERM_IDS),
  version: z.number(),
  title: z.string(),
  body: z.string(),
  required: z.boolean(),
})

export const termsSchema = z.array(termSchema)

export type SignupTerm = z.infer<typeof termSchema>

export const signupAddressSchema = z.object({
  // 별칭 상한 20자 — addresses/types.ts aliasSchema 와 동일 기준 (B1-2)
  label: z.string().min(1, '주소 라벨이 필요합니다').max(20, '별칭은 20자 이하여야 합니다'),
  roadAddress: z.string().min(1, '도로명 주소를 선택해주세요'),
  jibunAddress: z.string().optional(),
  detailAddress: z.string().optional(),
  zonecode: z.string().optional(),
  sigunguCode: z.string().regex(/^\d{5}$/, '시군구코드를 확인해주세요'),
  roadnameCode: z.string().regex(/^\d{1,7}$/, '도로명번호를 확인해주세요'),
})

export type SignupAddress = z.infer<typeof signupAddressSchema>

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  accessExpiresIn: z.number().optional(),
})

export const phoneVerificationTokenResponseSchema = z.object({
  verificationToken: z.string(),
})

export const emailAvailabilityResponseSchema = z.object({
  available: z.boolean(),
})

export const signupInputSchema = z
  .object({
    // Step 1 — 약관
    agreedTermIds: z.array(z.number()),
    // Step 2 — 계정
    email: z.string().email('이메일 형식이 아닙니다'),
    password: passwordSchema,
    passwordConfirm: z.string(),
    // 중복확인 통과한 이메일 (게이트용 — email 과 같아야 다음 진행, 수정 시 무효화)
    checkedEmail: z.string().optional(),
    // Step 3 — 본인인증
    name: z.string().min(1, '이름을 입력해주세요'),
    phone: z.string().regex(/^010-\d{4}-\d{4}$/, '휴대폰 번호를 확인해주세요'),
    verificationToken: z.string().min(1, '휴대폰 본인인증이 필요합니다'),
    // Step 4 — 주소
    address: signupAddressSchema.nullable(),
    // Step 5 — 프로필
    nickname: z.string().min(2, '2자 이상이어야 합니다').max(12, '12자 이하여야 합니다'),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })

export type SignupInput = z.infer<typeof signupInputSchema>

/** step 전환 시 부분 검증할 필드 (SignupPage 의 form.trigger 에 사용) */
export const STEP_FIELDS: Record<number, (keyof SignupInput)[]> = {
  1: ['agreedTermIds'],
  2: ['email', 'password', 'passwordConfirm'],
  3: ['name', 'phone', 'verificationToken'],
  4: ['address'],
  5: ['nickname'],
}

/**
 * 로그인 입력 (auth.md §4-5). 로그인은 비밀번호 구성 규칙(8자·영문·숫자·특수)을 검증/노출하지 않는다
 * — 정책 노출 방지 + 과거 규칙 이전 계정 차단 방지. 형식 검증은 이메일만, 비밀번호는 필수 여부만 본다.
 * 실제 자격 판정은 서버가 하고 실패는 LOGIN_FAILED 단일 메시지로 거부 (가입 폼의 passwordSchema 와 별개).
 * keepSignedIn 기본값은 폼 defaultValues 에서 true 로 설정 (스키마엔 .default 미사용 — RHF 타입 단순화).
 */
export const loginInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
  keepSignedIn: z.boolean(),
})

export type LoginInput = z.infer<typeof loginInputSchema>

// ── 소셜 로그인 (카카오) ──────────────────────────────────────────────
/**
 * 카카오 인가코드 교환(POST /auth/kakao) 응답 — BE 계약. status 로 분기.
 * - EXISTING: 기존 매핑 회원 → access 발급(+refresh 쿠키). accessExpiresIn(초).
 * - NEW: 신규 → socialToken(15분) + 카카오 프로필(email 필수, nickname 은 미동의 시 생략 가능). 추가정보 위저드로.
 */
export const kakaoExchangeResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('EXISTING'),
    accessToken: z.string(),
    accessExpiresIn: z.number(),
  }),
  z.object({
    status: z.literal('NEW'),
    socialToken: z.string(),
    email: z.string(),
    nickname: z.string().optional(),
  }),
])
export type KakaoExchangeResult = z.infer<typeof kakaoExchangeResultSchema>

/** 카카오 NEW → 추가정보 위저드로 넘기는 컨텍스트 (소셜 가입 제출 전 보관). socialToken 15분 유효. */
export interface SocialSignupContext {
  socialToken: string
  email: string
  nickname?: string
}

/**
 * 소셜 가입 폼 스키마 — 신규 추가정보 4스텝(약관·본인인증·주소·닉네임)을 회원가입 스텝 컴포넌트와
 * 공유하려고 SignupInput 과 같은 형상을 유지한다. 단 카카오 가입은 비밀번호를 받지 않으므로
 * password/passwordConfirm 은 정책 검증 없이 통과(미렌더·미사용), email 은 카카오 제공값.
 */
export const socialSignupFormSchema = z
  .object({
    agreedTermIds: z.array(z.number()),
    email: z.string().email('이메일 형식이 아닙니다'),
    password: z.string(),
    passwordConfirm: z.string(),
    name: z.string().min(1, '이름을 입력해주세요'),
    phone: z.string().regex(/^010-\d{4}-\d{4}$/, '휴대폰 번호를 확인해주세요'),
    verificationToken: z.string().min(1, '휴대폰 본인인증이 필요합니다'),
    address: signupAddressSchema.nullable(),
    nickname: z.string().min(2, '2자 이상이어야 합니다').max(12, '12자 이하여야 합니다'),
  })

/** 소셜 가입 제출 payload — 비밀번호 없음(소셜 전용 계정 = password_hash NULL). socialToken 으로 카카오 신원 식별. */
export interface SocialSignupInput {
  socialToken: string
  email: string
  agreedTermIds: number[]
  name: string
  phone: string
  verificationToken: string
  address: SignupAddress
  nickname: string
}

// ── 비밀번호 재설정 ───────────────────────────────────────────────────
/** POST /auth/password-resets/verify-identity 응답 스키마 (BE 계약) */
export const passwordResetVerifyResponseSchema = z.object({
  resetToken: z.string(),
})

/** 비밀번호 재설정 에러 코드 (노션 AC) */
export const PASSWORD_RESET_ERROR = {
  /** 이메일 미등록 또는 이메일↔휴대폰 불일치 — 존재 여부 비노출 위해 동일 코드 */
  RESET_VERIFICATION_FAILED: 'RESET_VERIFICATION_FAILED',
  /** 본인인증 토큰 없거나 만료 */
  PHONE_VERIFICATION_REQUIRED: 'PHONE_VERIFICATION_REQUIRED',
  /** 소셜 전용 계정(password_hash NULL) — 카카오 로그인 안내 */
  SOCIAL_ONLY_ACCOUNT: 'SOCIAL_ONLY_ACCOUNT',
  /** 새 비밀번호 정책 미충족 */
  PASSWORD_POLICY_VIOLATION: 'PASSWORD_POLICY_VIOLATION',
} as const

/**
 * 비밀번호 재설정 폼 (노션 명세: 이메일 → 휴대폰 본인인증 → 새 비밀번호).
 * 휴대폰 unique X 정책상 이메일+휴대폰 쌍으로 계정 식별. verificationToken 은 본인인증(OTP) 결과.
 * newPassword 는 가입과 동일한 passwordSchema(§8) 공유.
 */
export const passwordResetSchema = z
  .object({
    email: z.string().email('이메일 형식이 아닙니다'),
    phone: z.string().regex(/^010-\d{4}-\d{4}$/, '휴대폰 번호를 확인해주세요'),
    verificationToken: z.string().min(1, '휴대폰 본인인증이 필요합니다'),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['newPasswordConfirm'],
  })

export type PasswordResetInput = z.infer<typeof passwordResetSchema>

// ── 비밀번호 변경 (로그인 상태) ───────────────────────────────────────
/** 비밀번호 변경 에러 코드 (노션 「비밀번호 변경」 명세) */
export const PASSWORD_CHANGE_ERROR = {
  /** 현재 비밀번호 불일치 */
  CURRENT_PASSWORD_MISMATCH: 'CURRENT_PASSWORD_MISMATCH',
  /** 새 비밀번호 정책 미충족 */
  PASSWORD_POLICY_VIOLATION: 'PASSWORD_POLICY_VIOLATION',
} as const

/**
 * 비밀번호 변경 폼 (로그인 상태 — 노션 「비밀번호 변경」 명세).
 * 현재 비번 확인 후 새 비번으로 갱신. 새 비번은 가입/재설정과 동일 passwordSchema(§8) 공유.
 * "새 비번 ≠ 현재 비번" 강제 규칙 없음(재설정과 동일 — 기존 비번 동일 허용).
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요'),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['newPasswordConfirm'],
  })

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
