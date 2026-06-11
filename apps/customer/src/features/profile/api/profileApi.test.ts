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
      const { id, email, nickname } = BASE_DTO
      vi.mocked(apiClient.get).mockResolvedValue({ data: { id, email, nickname } })
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
    const STATS_DTO = { monthlySavings: 14300, rescuedCount: 4, favoriteCount: 4 }

    it('GET_/customers/me/stats_엔드포인트를_호출한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: STATS_DTO })
      await profileApi.getStats()
      expect(apiClient.get).toHaveBeenCalledWith('/customers/me/stats')
    })

    it('BE_DTO를_FE_ProfileStats로_매핑한다_절약·구출·단골', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: STATS_DTO })
      const stats = await profileApi.getStats()
      expect(stats.monthlySavings).toBe(14300)
      expect(stats.rescuedCount).toBe(4)
      expect(stats.favoriteCount).toBe(4)
    })

    it('필드_누락·null이면_0으로_매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { monthlySavings: null } })
      const stats = await profileApi.getStats()
      expect(stats.monthlySavings).toBe(0)
      expect(stats.rescuedCount).toBe(0)
      expect(stats.favoriteCount).toBe(0)
    })
  })
})
