import { apiClient } from '@/shared/lib/axios'
import {
  notificationListResponseSchema,
  notificationSettingsSchema,
  unreadCountResponseSchema,
  type Notification,
  type NotificationSegment,
  type NotificationSettingKey,
  type NotificationSettings,
} from '../types'

export const notificationsApi = {
  /**
   * GET /api/v1/customers/me/notifications?segment=
   * segment=all → 파라미터 생략(서버가 전체 반환)
   * segment=deal|order → query param 전달(서버 세그먼트 필터)
   */
  async list(segment: NotificationSegment = 'all'): Promise<Notification[]> {
    const { data } = await apiClient.get('/customers/me/notifications', {
      params: segment !== 'all' ? { segment } : undefined,
    })
    return notificationListResponseSchema.parse(data).items
  },

  /** GET /api/v1/customers/me/notifications/unread-count → { count: number } */
  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get('/customers/me/notifications/unread-count')
    return unreadCountResponseSchema.parse(data).count
  },

  /** PATCH /api/v1/customers/me/notifications/{id}/read (body 없음, 200 no-content) */
  async markRead(id: number): Promise<void> {
    await apiClient.patch(`/customers/me/notifications/${id}/read`)
  },

  /** PATCH /api/v1/customers/me/notifications/read-all (body 없음) */
  async markAllRead(): Promise<void> {
    await apiClient.patch('/customers/me/notifications/read-all')
  },

  /** GET /api/v1/customers/me/notification-settings */
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await apiClient.get('/customers/me/notification-settings')
    return notificationSettingsSchema.parse(data)
  },

  /**
   * PATCH /api/v1/customers/me/notification-settings/{key}
   * body: { enabled: boolean } → 전체 settings 반환
   */
  async updateSetting(key: NotificationSettingKey, on: boolean): Promise<NotificationSettings> {
    const { data } = await apiClient.patch(`/customers/me/notification-settings/${key}`, {
      enabled: on,
    })
    return notificationSettingsSchema.parse(data)
  },
}
