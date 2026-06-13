import { z } from 'zod'

/**
 * 관리자 로그인 입력 (BE AdminLoginRequest — username + password).
 * admin 은 내부 운영 도구라 카카오·가입·비밀번호 찾기가 없다 (auth.md §4 변형).
 * 형식 규칙(길이/문자)은 검증/노출하지 않고 필수 여부만 본다 — 실제 자격 판정은 서버,
 * 실패는 LOGIN_FAILED 단일 메시지로 거부(존재 여부 비노출).
 */
export const loginInputSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})
export type LoginInput = z.infer<typeof loginInputSchema>

/**
 * 토큰 응답 — accessToken 만 사용한다 (refresh 는 HttpOnly 쿠키, accessExpiresIn 은 미사용).
 * Zod 가 accessToken 존재를 런타임 보장하고 그 외 키는 strip 한다.
 */
export const tokenResponseSchema = z.object({
  accessToken: z.string(),
})
