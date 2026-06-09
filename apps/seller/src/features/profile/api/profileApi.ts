import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { formatPhone } from '@/shared/lib/formatPhone'
import type { Profile } from '../types'

/** M1: 아바타는 BE 비범위 — 기본 이모지 상수로 주입 */
const DEFAULT_AVATAR_EMOJI = '👤'

/**
 * BE `/api/v1/seller/me` 응답 Zod 스키마 (필요 필드만 tighten).
 * M2: phone은 사장 계정에선 항상 non-null (z.string() 필수).
 * SpringDoc 관행상 전부 optional 으로 생성되지만 email/name/phone 은 비즈니스 필수.
 */
const sellerMeResponseSchema = z.object({
  email: z.string(),
  name: z.string(),
  phone: z.string(),
  id: z.number().optional(),
  phoneVerifiedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
})

/** BE 응답 → 도메인 Profile 매핑 */
function toProfile(res: z.infer<typeof sellerMeResponseSchema>): Profile {
  return {
    name: res.name,
    email: res.email,
    phone: formatPhone(res.phone), // M2: '01012345678' → '010-1234-5678'
    avatarEmoji: DEFAULT_AVATAR_EMOJI, // M1: BE 아바타 없음 — 기본 이모지 주입
  } satisfies Profile
}

export const profileApi = {
  async getProfile(): Promise<Profile> {
    const res = await apiClient.get('/seller/me')
    return toProfile(sellerMeResponseSchema.parse(res.data))
  },

  async updateName(name: string): Promise<Profile> {
    const res = await apiClient.patch('/seller/me', { name })
    return toProfile(sellerMeResponseSchema.parse(res.data))
  },
}
