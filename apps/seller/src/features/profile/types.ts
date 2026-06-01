import { z } from 'zod'

/**
 * 사장 프로필(내 정보) 도메인 타입 / Zod 스키마.
 *
 * - 수정 범위 = 실명 조회·수정 (노션 "사장 프로필 관리"). 휴대폰·이메일·사진·사업자 정보는 비범위.
 * - 실명은 자기 신고 값(sellers.name) — SMS OTP만 쓰므로 실제 실명 보장 X, 사후 검증은 추후.
 */

/** 실명 2~20자 (노션 AC) — 가명·별명 금지(실명만, 정책) */
export const nameSchema = z
  .string()
  .min(2, '실명은 2자 이상이어야 해요')
  .max(20, '실명은 20자 이하여야 해요')

/** 프로필 (마이 허브 헤더 + 내 정보 수정 화면) */
export const profileSchema = z.object({
  name: z.string(), // 실명 (수정 가능)
  email: z.string(), // 대표 이메일 = 계정 식별자 (읽기 전용)
  phone: z.string(), // 휴대폰 번호 (표시용 — 변경은 비범위, OTP 별도)
  avatarEmoji: z.string(), // 아바타 이모지 (사진 업로드는 비범위)
})
export type Profile = z.infer<typeof profileSchema>

/** 실명 수정 폼 (react-hook-form) */
export const nameFormSchema = z.object({
  name: nameSchema,
})
export type NameFormValues = z.infer<typeof nameFormSchema>

/** 도메인 에러 코드 (노션 AC) — mock API 가 ApiError.code 로 사용 */
export const PROFILE_ERROR = {
  NAME_LENGTH: 'NAME_LENGTH',
} as const
