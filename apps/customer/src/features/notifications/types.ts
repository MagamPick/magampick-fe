import { z } from 'zod'

/**
 * 알림 (소비자) 도메인 타입 / Zod 스키마 — Phase 7: 알림 목록 조회(알림센터) · 알림 설정.
 *
 * BE 계약:
 * - id: number (BE int64)
 * - category: 소문자 9종 (deal/order/review/benefit/system/refund/settlement/notice/inquiry)
 * - icon 필드 없음 — FE 에서 category 기반으로 파생
 * - link: string | null (FE는 사용하지 않고 category 로 라우팅)
 */

/** 알림 종류 — BE 9종 소문자. 미지 값은 'system' 으로 방어. */
export const notificationCategorySchema = z
  .enum(['deal', 'order', 'review', 'benefit', 'system', 'refund', 'settlement', 'notice', 'inquiry'])
  .catch('system')
export type NotificationCategory = z.infer<typeof notificationCategorySchema>

/** 알림 1건 BE 응답 스키마 */
export const notificationSchema = z.object({
  id: z.number(),
  category: notificationCategorySchema,
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  read: z.boolean(),
  link: z.string().nullish(),
})
export type Notification = z.infer<typeof notificationSchema>

/** GET /notifications → { items: NotificationResponse[] } */
export const notificationListResponseSchema = z.object({
  items: z.array(notificationSchema).default([]),
})

/** GET /notifications/unread-count → { count: number } */
export const unreadCountResponseSchema = z.object({ count: z.number() })

/** 알림센터 세그먼트(소비자) — 전체 / 마감 할인(deal) / 주문(order) */
export const notificationSegmentSchema = z.enum(['all', 'deal', 'order'])
export type NotificationSegment = z.infer<typeof notificationSegmentSchema>

/** 알림 설정 토글 키 (6종, 노션 「알림 설정(소비자)」) */
export const notificationSettingKeySchema = z.enum([
  'nearbyDeal',
  'favoriteStore',
  'orderRefund',
  'reviewReply',
  'eventBenefit',
  'marketing',
])
export type NotificationSettingKey = z.infer<typeof notificationSettingKeySchema>

/** 설정 상태 = 키별 on/off (전체 키 고정 — 부분 record 회피) */
export const notificationSettingsSchema = z.object({
  nearbyDeal: z.boolean(),
  favoriteStore: z.boolean(),
  orderRefund: z.boolean(),
  reviewReply: z.boolean(),
  eventBenefit: z.boolean(),
  marketing: z.boolean(),
})
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
