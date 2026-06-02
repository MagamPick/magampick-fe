import { z } from 'zod'

/** 비밀번호 룰 (auth.md §8) — 로그인/가입/변경/재설정 공유 */
export const passwordSchema = z
  .string()
  .min(8, '8자 이상이어야 합니다')
  .regex(/[A-Za-z]/, '영문을 포함해야 합니다')
  .regex(/\d/, '숫자를 포함해야 합니다')
  .regex(/[^A-Za-z\d]/, '특수문자를 포함해야 합니다')

/** 약관 type — 사장: 만 19세 (소비자 만 14세와 다름). 5종 통일 term type */
export const TERM_IDS = ['AGE_19', 'TERMS_OF_SERVICE', 'PRIVACY', 'LOCATION', 'MARKETING'] as const
export type TermId = (typeof TERM_IDS)[number]
export const REQUIRED_TERM_IDS: TermId[] = ['AGE_19', 'TERMS_OF_SERVICE', 'PRIVACY', 'LOCATION']

export const signupInputSchema = z
  .object({
    // Step 1 — 약관
    agreedTermIds: z.array(z.enum(TERM_IDS)),
    // Step 2 — 계정
    email: z.string().email('이메일 형식이 아닙니다'),
    password: passwordSchema,
    passwordConfirm: z.string(),
    // Step 3 — 휴대폰 본인인증
    phone: z.string().regex(/^010-\d{4}-\d{4}$/, '휴대폰 번호를 확인해주세요'),
    verificationToken: z.string().min(1, '휴대폰 본인인증이 필요합니다'),
    // Step 4 — 실명 (자기 신고, sellers.name, UNIQUE X)
    name: z.string().min(2, '2자 이상이어야 합니다').max(20, '20자 이하여야 합니다'),
    // Step 5 — 첫 매장 등록 (디테일은 → 매장 등록 신청 명세)
    representativeName: z.string().min(1, '대표자명을 입력해주세요'),
    businessNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, '사업자등록번호를 확인해주세요'),
    openDate: z.string().min(1, '개업일자를 선택해주세요'),
    bizVerified: z.boolean(),
    storeName: z.string().min(1, '매장명을 입력해주세요'),
    storeAddress: z.string().min(1, '매장 주소를 등록해주세요'),
    storeAddressDetail: z.string().optional(),
    storePhone: z.string().min(1, '매장 전화번호를 입력해주세요'),
    photoAdded: z.boolean().optional(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })
  .refine((d) => REQUIRED_TERM_IDS.every((t) => d.agreedTermIds.includes(t)), {
    message: '필수 약관에 모두 동의해주세요',
    path: ['agreedTermIds'],
  })
  .refine((d) => d.bizVerified, {
    message: '사업자등록번호 조회를 완료해주세요',
    path: ['bizVerified'],
  })

export type SignupInput = z.infer<typeof signupInputSchema>

/** step 전환 시 부분 검증할 필드 (SignupPage 의 stepValid 에 사용) */
export const STEP_FIELDS: Record<number, (keyof SignupInput)[]> = {
  1: ['agreedTermIds'],
  2: ['email', 'password', 'passwordConfirm'],
  3: ['phone', 'verificationToken'],
  4: ['name'],
  5: [
    'representativeName',
    'businessNumber',
    'openDate',
    'bizVerified',
    'storeName',
    'storeAddress',
    'storePhone',
  ],
}

/**
 * 로그인 입력 (auth.md §4-5). 사장 로그인은 이메일+비밀번호만 — 카카오·로그인상태유지 토글 없음 (auth.md §6).
 * 로그인은 비밀번호 구성 규칙(8자·영문·숫자·특수)을 검증/노출하지 않는다 — 정책 노출 방지 + 과거 규칙 이전 계정 차단 방지.
 * 형식 검증은 이메일만, 비밀번호는 필수 여부만. 실제 자격 판정은 서버가 하고 실패는 LOGIN_FAILED 단일 메시지로 거부.
 */
export const loginInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
})

export type LoginInput = z.infer<typeof loginInputSchema>

// ── 비밀번호 재설정 ───────────────────────────────────────────────────
/** 비밀번호 재설정 에러 코드 (노션 AC) */
export const PASSWORD_RESET_ERROR = {
  /** 이메일 미등록 또는 이메일↔휴대폰 불일치 — 존재 여부 비노출 위해 동일 코드 */
  RESET_VERIFICATION_FAILED: 'RESET_VERIFICATION_FAILED',
  /** 본인인증 토큰 없거나 만료 */
  PHONE_VERIFICATION_REQUIRED: 'PHONE_VERIFICATION_REQUIRED',
  /** 소셜 전용 계정(password_hash NULL) — 사장은 소셜 가입 없음(방어용 코드) */
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
