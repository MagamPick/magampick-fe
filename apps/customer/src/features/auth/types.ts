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
export const REQUIRED_TERM_IDS: TermId[] = ['AGE_14', 'TERMS_OF_SERVICE', 'PRIVACY', 'LOCATION']

export const signupInputSchema = z
  .object({
    // Step 1 — 약관
    agreedTermIds: z.array(z.enum(TERM_IDS)),
    // Step 2 — 계정
    email: z.string().email('이메일 형식이 아닙니다'),
    password: passwordSchema,
    passwordConfirm: z.string(),
    // Step 3 — 본인인증
    name: z.string().min(1, '이름을 입력해주세요'),
    phone: z.string().regex(/^010-\d{4}-\d{4}$/, '휴대폰 번호를 확인해주세요'),
    verificationToken: z.string().min(1, '휴대폰 본인인증이 필요합니다'),
    // Step 4 — 주소
    address: z.string().min(1, '기본 주소를 등록해주세요'),
    // Step 5 — 프로필
    nickname: z.string().min(2, '2자 이상이어야 합니다').max(12, '12자 이하여야 합니다'),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })
  .refine((d) => REQUIRED_TERM_IDS.every((t) => d.agreedTermIds.includes(t)), {
    message: '필수 약관에 모두 동의해주세요',
    path: ['agreedTermIds'],
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
