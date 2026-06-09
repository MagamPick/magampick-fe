import { z } from 'zod'

/**
 * 소비자 프로필(마이페이지) 도메인 타입 / Zod 스키마.
 *
 * - 프로필 수정 범위 = 닉네임 조회·수정 (노션 "소비자 프로필 관리"). 사진·전화·주소는 비범위.
 * - 통계(이번 달 절약·구한 음식·단골)는 주문/단골 도메인 연동 전까지 mock (profileApi 참조).
 */

/** BE CustomerProfileResponse DTO 스키마 (GET /customers/me, PATCH /customers/me 공통) */
export const profileResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  nickname: z.string(),
  phone: z.string().nullable().optional(), // 가입 직후 null 가능
  phoneVerifiedAt: z.string().optional(),
  createdAt: z.string().optional(),
})
export type ProfileResponse = z.infer<typeof profileResponseSchema>

/** 클라이언트 기본 아바타 이모지 (BE 아바타 필드 없음 — 사진 업로드는 비범위) */
export const DEFAULT_AVATAR_EMOJI = '🐶'

/** 닉네임 2~12자 (노션 AC) — 중복 허용 */
export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 2자 이상이어야 해요')
  .max(12, '닉네임은 12자 이하여야 해요')

/** 프로필 (마이페이지 헤더 + 내 정보 수정 화면) */
export const profileSchema = z.object({
  nickname: z.string(),
  email: z.string(), // 대표 이메일 = 계정 식별자 (읽기 전용)
  phone: z.string(), // 휴대폰 번호 (표시용 — BE null → '' 변환, 변경은 비범위)
  avatarEmoji: z.string(), // 아바타 이모지 (사진 업로드는 비범위)
})
export type Profile = z.infer<typeof profileSchema>

/** 마이페이지 통계 (mock — 주문/단골 도메인 연동 시 교체) */
export const profileStatsSchema = z.object({
  monthlySavings: z.number(), // 이번 달 절약 (원)
  rescuedCount: z.number(), // 구한 음식 (개)
  favoriteCount: z.number(), // 단골 가게 (곳)
})
export type ProfileStats = z.infer<typeof profileStatsSchema>

/** 닉네임 수정 폼 (react-hook-form) */
export const nicknameFormSchema = z.object({
  nickname: nicknameSchema,
})
export type NicknameFormValues = z.infer<typeof nicknameFormSchema>

/** 도메인 에러 코드 (노션 AC) — mock API 가 ApiError.code 로 사용 */
export const PROFILE_ERROR = {
  NICKNAME_LENGTH: 'NICKNAME_LENGTH',
} as const
