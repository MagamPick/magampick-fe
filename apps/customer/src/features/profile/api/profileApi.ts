import { apiClient } from '@/shared/lib/axios'
import {
  profileResponseSchema,
  type Profile,
  type ProfileStats,
  type ProfileResponse,
  DEFAULT_AVATAR_EMOJI,
} from '../types'

/**
 * 소비자 프로필 API.
 *
 * - getProfile / updateNickname: 실 BE 호출 (GET/PATCH /customers/me).
 *   응답 인터셉터가 envelope {success,data} 를 자동 unwrap → res.data = DTO. Zod 로 검증 후 FE Profile 반환.
 *   에러(400/404)는 인터셉터가 ApiError 로 정규화 → 그대로 throw 전파 (도메인 catch 없음).
 *
 * - getStats: mock 유지 — 주문/단골 도메인 연동 전까지 고정값 반환.
 *   TODO: orders/favorite 도메인 BE 엔드포인트 확정 후 교체.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/** 시드 통계 (연동 시 orders/favorite 도메인에서 산출) */
const SEED_STATS: ProfileStats = {
  monthlySavings: 14300,
  rescuedCount: 4,
  favoriteCount: 4,
}

/** BE DTO → FE Profile 변환. phone null/undefined 은 표시상 안전하게 '' 처리. */
function toProfile(dto: ProfileResponse): Profile {
  return {
    nickname: dto.nickname,
    email: dto.email,
    phone: dto.phone ?? '',
    avatarEmoji: DEFAULT_AVATAR_EMOJI,
  }
}

export const profileApi = {
  /** 내 프로필 조회 (GET /customers/me). */
  async getProfile(): Promise<Profile> {
    const res = await apiClient.get('/customers/me')
    return toProfile(profileResponseSchema.parse(res.data))
  },

  /**
   * 마이페이지 통계 — mock (주문/단골 BE 엔드포인트 없음).
   * 통계 BE 엔드포인트 존재하지 않음 — orders/favorite 도메인 연동 전까지 의도적 mock 유지.
   */
  async getStats(): Promise<ProfileStats> {
    await delay(200)
    return clone(SEED_STATS)
  },

  /** 닉네임 수정 (PATCH /customers/me). 길이 검증은 폼 Zod + BE 담당. */
  async updateNickname(nickname: string): Promise<Profile> {
    const res = await apiClient.patch('/customers/me', { nickname })
    return toProfile(profileResponseSchema.parse(res.data))
  },
}
