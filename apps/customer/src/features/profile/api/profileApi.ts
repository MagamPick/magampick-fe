import { apiClient } from '@/shared/lib/axios'
import {
  profileResponseSchema,
  customerStatsResponseSchema,
  type Profile,
  type ProfileStats,
  type ProfileResponse,
  type CustomerStatsResponse,
  DEFAULT_AVATAR_EMOJI,
} from '../types'

/**
 * 소비자 프로필 API.
 *
 * - getProfile / updateNickname: 실 BE 호출 (GET/PATCH /customers/me).
 *   응답 인터셉터가 envelope {success,data} 를 자동 unwrap → res.data = DTO. Zod 로 검증 후 FE Profile 반환.
 *   에러(400/404)는 인터셉터가 ApiError 로 정규화 → 그대로 throw 전파 (도메인 catch 없음).
 *
 * - getStats: 실 BE 호출 (GET /customers/me/stats). 절약=마감할인 합, 구출=누적 (BE 확정 정책).
 */

/** BE DTO → FE Profile 변환. phone null/undefined 은 표시상 안전하게 '' 처리. */
function toProfile(dto: ProfileResponse): Profile {
  return {
    nickname: dto.nickname,
    email: dto.email,
    phone: dto.phone ?? '',
    avatarEmoji: DEFAULT_AVATAR_EMOJI,
  }
}

/** BE CustomerStatsResponse → FE ProfileStats. 누락/null 은 0 (BE 빈 데이터 0 보장 + 방어). */
function toStats(dto: CustomerStatsResponse): ProfileStats {
  return {
    monthlySavings: dto.monthlySavings ?? 0,
    rescuedCount: dto.rescuedCount ?? 0,
    favoriteCount: dto.favoriteCount ?? 0,
  }
}

export const profileApi = {
  /** 내 프로필 조회 (GET /customers/me). */
  async getProfile(): Promise<Profile> {
    const res = await apiClient.get('/customers/me')
    return toProfile(profileResponseSchema.parse(res.data))
  },

  /** 마이페이지 통계 조회 (GET /customers/me/stats). */
  async getStats(): Promise<ProfileStats> {
    const res = await apiClient.get('/customers/me/stats')
    return toStats(customerStatsResponseSchema.parse(res.data))
  },

  /** 닉네임 수정 (PATCH /customers/me). 길이 검증은 폼 Zod + BE 담당. */
  async updateNickname(nickname: string): Promise<Profile> {
    const res = await apiClient.patch('/customers/me', { nickname })
    return toProfile(profileResponseSchema.parse(res.data))
  },
}
