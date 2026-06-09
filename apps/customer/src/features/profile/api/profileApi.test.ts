import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { profileApi } from './profileApi'
import { DEFAULT_AVATAR_EMOJI } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

const BASE_DTO = {
  id: 1,
  email: 'user@magampick.com',
  nickname: '마감픽사용자',
  phone: '010-1234-5678',
}

describe('profileApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('GET_/customers/me_엔드포인트를_호출한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: BASE_DTO })
      await profileApi.getProfile()
      expect(apiClient.get).toHaveBeenCalledWith('/customers/me')
    })

    it('BE_DTO를_FE_Profile로_변환한다_닉네임·이메일·전화·아바타', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: BASE_DTO })
      const profile = await profileApi.getProfile()
      expect(profile.nickname).toBe('마감픽사용자')
      expect(profile.email).toBe('user@magampick.com')
      expect(profile.phone).toBe('010-1234-5678')
      expect(profile.avatarEmoji).toBe(DEFAULT_AVATAR_EMOJI)
    })

    it('phone_null이면_빈_문자열로_변환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { ...BASE_DTO, phone: null } })
      const profile = await profileApi.getProfile()
      expect(profile.phone).toBe('')
    })

    it('phone_undefined이면_빈_문자열로_변환한다', async () => {
      const { phone: _p, ...rest } = BASE_DTO
      vi.mocked(apiClient.get).mockResolvedValue({ data: rest })
      const profile = await profileApi.getProfile()
      expect(profile.phone).toBe('')
    })
  })

  describe('updateNickname', () => {
    it('PATCH_/customers/me에_nickname을_전송한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...BASE_DTO, nickname: '새닉네임' } })
      await profileApi.updateNickname('새닉네임')
      expect(apiClient.patch).toHaveBeenCalledWith('/customers/me', { nickname: '새닉네임' })
    })

    it('갱신된_닉네임이_담긴_Profile을_반환한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...BASE_DTO, nickname: '새닉네임' } })
      const profile = await profileApi.updateNickname('새닉네임')
      expect(profile.nickname).toBe('새닉네임')
    })
  })

  describe('getStats', () => {
    it('통계_mock_데이터를_반환한다', async () => {
      const stats = await profileApi.getStats()
      expect(stats.monthlySavings).toBeGreaterThanOrEqual(0)
      expect(stats.rescuedCount).toBeGreaterThanOrEqual(0)
      expect(stats.favoriteCount).toBeGreaterThanOrEqual(0)
    })

    it('apiClient를_호출하지_않는다_mock_유지', async () => {
      await profileApi.getStats()
      expect(apiClient.get).not.toHaveBeenCalled()
    })
  })
})
