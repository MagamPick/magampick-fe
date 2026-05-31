import { ApiError } from '@/shared/lib/apiError'
import { PROFILE_ERROR, type Profile, type ProfileStats } from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 customer 프로필 API 가 아직 연동 전이라 가짜 응답.
 * 모듈 인메모리 `profile` 로 닉네임 수정을 흉내낸다(세션 내 유지). 닉네임 2~12자(노션 AC)는 여기서 enforce.
 * 통계(`getStats`)는 주문/단골 도메인 연동 전까지 고정 mock — 연동 시 orders/favorite 에서 산출.
 * 연동 PR 에서 각 함수 본문을 apiClient 호출 + Zod 응답 검증으로 교체(시그니처 유지). SEED/store/__reset 제거.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/** 시드 프로필 (연동 시 제거) */
const SEED_PROFILE: Profile = {
  nickname: '마감픽사용자',
  email: 'user@magampick.com',
  phone: '010-1234-5678',
  avatarEmoji: '🐶',
}

/** 시드 통계 (연동 시 orders/favorite 도메인에서 산출) */
const SEED_STATS: ProfileStats = {
  monthlySavings: 14300,
  rescuedCount: 4,
  favoriteCount: 4,
}

let profile: Profile = clone(SEED_PROFILE)

export const profileApi = {
  async getProfile(): Promise<Profile> {
    await delay(200)
    return clone(profile)
  },

  async getStats(): Promise<ProfileStats> {
    await delay(200)
    return clone(SEED_STATS)
  },

  async updateNickname(nickname: string): Promise<Profile> {
    await delay(300)
    if (nickname.length < 2 || nickname.length > 12) {
      throw new ApiError(400, PROFILE_ERROR.NICKNAME_LENGTH, '닉네임은 2~12자여야 해요')
    }
    profile = { ...profile, nickname }
    return clone(profile)
  },
}

/** 테스트 전용 — `profile` 을 시드(또는 주어진 값)로 리셋. 연동 PR 에서 제거. */
export function __resetProfileStoreForTest(seed: Profile = SEED_PROFILE): void {
  profile = clone(seed)
}
