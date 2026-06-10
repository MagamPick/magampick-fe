import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationsApi } from './notificationsApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'

const mockedGet = vi.mocked(apiClient.get)
const mockedPatch = vi.mocked(apiClient.patch)

// BE 응답 픽스처 (number id, 소문자 category)
const makeItem = (id: number, category: string) => ({
  id,
  category,
  title: `알림 ${id}`,
  body: `본문 ${id}`,
  createdAt: '2026-06-10T10:00:00+09:00',
  read: false,
  link: null,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notificationsApi', () => {
  describe('list', () => {
    it('all 세그먼트는 params 없이 호출하고 items 를 반환', async () => {
      const items = [makeItem(1, 'deal'), makeItem(2, 'order')]
      mockedGet.mockResolvedValueOnce({ data: { items } })

      const result = await notificationsApi.list('all')

      expect(mockedGet).toHaveBeenCalledWith('/customers/me/notifications', { params: undefined })
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
    })

    it('deal 세그먼트는 params.segment=deal 로 호출', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [makeItem(1, 'deal')] } })

      await notificationsApi.list('deal')

      expect(mockedGet).toHaveBeenCalledWith('/customers/me/notifications', {
        params: { segment: 'deal' },
      })
    })

    it('order 세그먼트는 params.segment=order 로 호출', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [makeItem(2, 'order')] } })

      await notificationsApi.list('order')

      expect(mockedGet).toHaveBeenCalledWith('/customers/me/notifications', {
        params: { segment: 'order' },
      })
    })

    it('items 가 비어 있으면 빈 배열 반환', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [] } })

      const result = await notificationsApi.list('all')
      expect(result).toEqual([])
    })

    it('미지 category 는 system 으로 방어', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [makeItem(99, 'unknown_future')] } })

      const result = await notificationsApi.list('all')
      expect(result[0].category).toBe('system')
    })
  })

  describe('unreadCount', () => {
    it('count 를 숫자로 반환', async () => {
      mockedGet.mockResolvedValueOnce({ data: { count: 3 } })

      const count = await notificationsApi.unreadCount()

      expect(mockedGet).toHaveBeenCalledWith('/customers/me/notifications/unread-count')
      expect(count).toBe(3)
    })
  })

  describe('markRead', () => {
    it('id(number) 로 PATCH 호출', async () => {
      mockedPatch.mockResolvedValueOnce({ data: null })

      await notificationsApi.markRead(42)

      expect(mockedPatch).toHaveBeenCalledWith('/customers/me/notifications/42/read')
    })
  })

  describe('markAllRead', () => {
    it('/read-all 에 PATCH 호출', async () => {
      mockedPatch.mockResolvedValueOnce({ data: null })

      await notificationsApi.markAllRead()

      expect(mockedPatch).toHaveBeenCalledWith('/customers/me/notifications/read-all')
    })
  })

  describe('getSettings', () => {
    it('설정 6종 객체를 반환', async () => {
      mockedGet.mockResolvedValueOnce({
        data: {
          nearbyDeal: true,
          favoriteStore: true,
          orderRefund: true,
          reviewReply: true,
          eventBenefit: false,
          marketing: false,
        },
      })

      const settings = await notificationsApi.getSettings()

      expect(mockedGet).toHaveBeenCalledWith('/customers/me/notification-settings')
      expect(settings.nearbyDeal).toBe(true)
      expect(settings.marketing).toBe(false)
    })
  })

  describe('updateSetting', () => {
    it('key/enabled 를 body 에 담아 PATCH 하고 설정 반환', async () => {
      mockedPatch.mockResolvedValueOnce({
        data: {
          nearbyDeal: true,
          favoriteStore: true,
          orderRefund: true,
          reviewReply: true,
          eventBenefit: false,
          marketing: true,
        },
      })

      const result = await notificationsApi.updateSetting('marketing', true)

      expect(mockedPatch).toHaveBeenCalledWith('/customers/me/notification-settings/marketing', {
        enabled: true,
      })
      expect(result.marketing).toBe(true)
    })
  })
})
