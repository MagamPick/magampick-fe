import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { notificationsApi } from './notificationsApi'

/** BE NotificationResponse 픽스처 */
const beNotification = {
  id: 1,
  category: 'order',
  title: '새 주문이 들어왔어요',
  body: '빵순이님 · 버터 크루아상 외 2건',
  createdAt: '2026-06-11T10:00:00.000Z',
  read: false,
  link: '/orders',
}

const beSettings = {
  newOrder: true,
  orderCancel: true,
  refundRequest: true,
  newReview: true,
  notice: true,
  marketing: false,
}

describe('notificationsApi (사장)', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('list', () => {
    it('GET /seller/notifications 호출하고 Notification[] 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [beNotification] } })

      const result = await notificationsApi.list()

      expect(apiClient.get).toHaveBeenCalledWith('/seller/notifications')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1', // number → string
        category: 'order',
        title: '새 주문이 들어왔어요',
        body: '빵순이님 · 버터 크루아상 외 2건',
        read: false,
        link: '/orders',
      })
    })

    it('{items} 언랩 — items 없으면 빈 배열', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

      const result = await notificationsApi.list()

      expect(result).toEqual([])
    })

    it('createdAt 내림차순(최신순)으로 정렬한다', async () => {
      const older = { ...beNotification, id: 2, createdAt: '2026-06-10T10:00:00.000Z' }
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { items: [older, beNotification] },
      })

      const result = await notificationsApi.list()

      expect(result[0].id).toBe('1') // 최신 먼저
      expect(result[1].id).toBe('2')
    })

    it('optional 필드 없는 응답은 기본값으로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [{ id: 5 }] } })

      const result = await notificationsApi.list()

      expect(result[0]).toMatchObject({
        id: '5',
        category: '',
        title: '',
        body: '',
        read: false,
        link: null,
      })
    })
  })

  describe('unreadCount', () => {
    it('GET /seller/notifications/unread-count 호출하고 count 반환', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { count: 3 } })

      const result = await notificationsApi.unreadCount()

      expect(apiClient.get).toHaveBeenCalledWith('/seller/notifications/unread-count')
      expect(result).toBe(3)
    })

    it('count 없으면 0 반환', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

      const result = await notificationsApi.unreadCount()

      expect(result).toBe(0)
    })
  })

  describe('markRead', () => {
    it('PATCH /seller/notifications/{id}/read 호출', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({})

      await notificationsApi.markRead('42')

      expect(apiClient.patch).toHaveBeenCalledWith('/seller/notifications/42/read')
    })
  })

  describe('markAllRead', () => {
    it('PATCH /seller/notifications/read-all 호출', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({})

      await notificationsApi.markAllRead()

      expect(apiClient.patch).toHaveBeenCalledWith('/seller/notifications/read-all')
    })
  })

  describe('getSettings', () => {
    it('GET /seller/notification-settings 호출하고 NotificationSettings 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: beSettings })

      const result = await notificationsApi.getSettings()

      expect(apiClient.get).toHaveBeenCalledWith('/seller/notification-settings')
      expect(result).toMatchObject({
        newOrder: true,
        orderCancel: true,
        refundRequest: true,
        newReview: true,
        notice: true,
        marketing: false,
      })
    })

    it('optional 필드 없으면 전부 false 기본값', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

      const result = await notificationsApi.getSettings()

      expect(result).toEqual({
        newOrder: false,
        orderCancel: false,
        refundRequest: false,
        newReview: false,
        notice: false,
        marketing: false,
      })
    })
  })

  describe('updateSetting', () => {
    it('PATCH /seller/notification-settings/{key} 호출, body={enabled}, 응답 매핑', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...beSettings, marketing: true } })

      const result = await notificationsApi.updateSetting('marketing', true)

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/seller/notification-settings/marketing',
        { enabled: true },
      )
      expect(result.marketing).toBe(true)
    })
  })
})
