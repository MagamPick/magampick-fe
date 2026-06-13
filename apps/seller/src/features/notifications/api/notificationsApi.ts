import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import type { Notification, NotificationSettingKey, NotificationSettings } from '../types'

/**
 * 사장 알림 API — Phase 7: 알림 목록 조회(알림센터) · 알림 설정.
 * BE 엔드포인트: /seller/notifications, /seller/notification-settings
 * envelope {success, data} 는 axios 인터셉터가 자동 unwrap → data만 도착.
 */

// ─── BE Zod 스키마 ────────────────────────────────────────────────────────────

/** BE NotificationResponse */
const notificationResponseSchema = z.object({
  id: z.number().optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  createdAt: z.string().optional(),
  read: z.boolean().optional(),
  // BE 가 link 를 null 로 내려줄 수 있어 nullish 로 수용 — B3-3
  link: z.string().nullish(),
})

/** BE NotificationListResponse */
const notificationListResponseSchema = z.object({
  items: z.array(notificationResponseSchema).optional(),
})

/** BE UnreadCountResponse */
const unreadCountResponseSchema = z.object({
  count: z.number().optional(),
})

/** BE SellerNotificationSettingsResponse */
const sellerNotificationSettingsResponseSchema = z.object({
  newOrder: z.boolean().optional(),
  orderCancel: z.boolean().optional(),
  refundRequest: z.boolean().optional(),
  newReview: z.boolean().optional(),
  notice: z.boolean().optional(),
  marketing: z.boolean().optional(),
})

type NotificationResponse = z.infer<typeof notificationResponseSchema>
type SellerNotificationSettingsResponse = z.infer<typeof sellerNotificationSettingsResponseSchema>

// ─── BE → FE 도메인 매핑 ─────────────────────────────────────────────────────

/**
 * BE NotificationResponse → FE Notification 변환.
 * - id: number → String()
 * - link: undefined → null (FE nullable 처리)
 * - optional 필드 전부 기본값 제공
 */
function mapToNotification(res: NotificationResponse): Notification {
  return {
    id: String(res.id ?? 0),
    category: res.category ?? '',
    title: res.title ?? '',
    body: res.body ?? '',
    createdAt: res.createdAt ?? '',
    read: res.read ?? false,
    link: res.link ?? null,
  }
}

/**
 * BE SellerNotificationSettingsResponse → FE NotificationSettings 변환.
 * - 6키 전부 ?? false 기본값
 */
function mapToSettings(res: SellerNotificationSettingsResponse): NotificationSettings {
  return {
    newOrder: res.newOrder ?? false,
    orderCancel: res.orderCancel ?? false,
    refundRequest: res.refundRequest ?? false,
    newReview: res.newReview ?? false,
    notice: res.notice ?? false,
    marketing: res.marketing ?? false,
  }
}

// ─── notificationsApi ─────────────────────────────────────────────────────────

export const notificationsApi = {
  /** 알림 목록 — 세그먼트 없이 최신순 단일 리스트 */
  async list(): Promise<Notification[]> {
    const { data } = await apiClient.get('/seller/notifications')
    const items = notificationListResponseSchema.parse(data).items ?? []
    const mapped = items.map(mapToNotification)
    // BE 정렬 신뢰하되 방어적으로 createdAt 내림차순 재정렬
    return mapped.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  /** 미읽음 수 (헤더 뱃지) */
  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get('/seller/notifications/unread-count')
    return unreadCountResponseSchema.parse(data).count ?? 0
  },

  /** 단건 읽음 처리 (idempotent) */
  async markRead(id: string): Promise<void> {
    await apiClient.patch('/seller/notifications/' + id + '/read')
  },

  /** 전체 읽음 처리 */
  async markAllRead(): Promise<void> {
    await apiClient.patch('/seller/notifications/read-all')
  },

  /** 알림 설정 조회 */
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await apiClient.get('/seller/notification-settings')
    return mapToSettings(sellerNotificationSettingsResponseSchema.parse(data))
  },

  /** 알림 설정 토글 — 변경 후 최신 설정 반환 */
  async updateSetting(key: NotificationSettingKey, on: boolean): Promise<NotificationSettings> {
    const { data } = await apiClient.patch('/seller/notification-settings/' + key, { enabled: on })
    return mapToSettings(sellerNotificationSettingsResponseSchema.parse(data))
  },
}
