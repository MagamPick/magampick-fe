import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { profileApi } from './profileApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

/** BE 응답 shape (SellerProfileResponse) — phone은 하이픈 없는 원시값 */
const beProfile = {
  id: 1,
  email: 'minsoo@magampick.com',
  name: '김민수',
  phone: '01012345678',
  phoneVerifiedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
}

describe('profileApi', () => {
  it('getProfile — GET /seller/me 호출 + 도메인 Profile로 매핑', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: beProfile })

    const result = await profileApi.getProfile()

    expect(apiClient.get).toHaveBeenCalledWith('/seller/me')
    expect(result).toEqual({
      name: '김민수',
      email: 'minsoo@magampick.com',
      phone: '010-1234-5678', // M2: formatPhone 변환 확인
      avatarEmoji: '👤', // M1: 기본 이모지 주입 확인
    })
  })

  it('updateName — PATCH /seller/me {name} 호출 + 갱신된 Profile 매핑', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { ...beProfile, name: '박상우' },
    })

    const result = await profileApi.updateName('박상우')

    expect(apiClient.patch).toHaveBeenCalledWith('/seller/me', { name: '박상우' })
    expect(result).toEqual({
      name: '박상우',
      email: 'minsoo@magampick.com',
      phone: '010-1234-5678',
      avatarEmoji: '👤',
    })
  })
})
