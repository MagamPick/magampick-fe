import { ApiError } from '@/shared/lib/apiError'
import { PROFILE_ERROR, type Profile } from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 seller 프로필 API 가 아직 연동 전이라 가짜 응답.
 * 모듈 인메모리 `profile` 로 실명 수정을 흉내낸다(세션 내 유지). 실명 2~20자(노션 AC)는 여기서 enforce.
 * 연동 PR 에서 각 함수 본문을 apiClient 호출 + Zod 응답 검증으로 교체(시그니처 유지). SEED/__reset 제거.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/** 시드 프로필 (연동 시 제거) — 프로토타입 53-profile-edit 값 */
const SEED_PROFILE: Profile = {
  name: '김민수',
  email: 'minsoo@magampick.com',
  phone: '010-1234-5678',
  avatarEmoji: '👤',
}

let profile: Profile = clone(SEED_PROFILE)

export const profileApi = {
  async getProfile(): Promise<Profile> {
    await delay(200)
    return clone(profile)
  },

  async updateName(name: string): Promise<Profile> {
    await delay(300)
    if (name.length < 2 || name.length > 20) {
      throw new ApiError(400, PROFILE_ERROR.NAME_LENGTH, '실명은 2~20자여야 해요')
    }
    profile = { ...profile, name }
    return clone(profile)
  },
}

/** 테스트 전용 — `profile` 을 시드(또는 주어진 값)로 리셋. 연동 PR 에서 제거. */
export function __resetProfileStoreForTest(seed: Profile = SEED_PROFILE): void {
  profile = clone(seed)
}
