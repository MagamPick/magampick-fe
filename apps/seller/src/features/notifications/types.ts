import { z } from 'zod'

/**
 * 알림 (사장) 도메인 타입 / Zod 스키마 — Phase 7: 알림 목록 조회(알림센터) · 알림 설정(사장).
 *
 * 백엔드 `notification` 미구현 → mock. 사장 알림센터는 **세그먼트 없이 시간순 단일 리스트**(사용자 결정,
 * 노션 「알림 목록 조회」 본문). category 는 아이콘/의미 구분용이며 필터 UI 는 없다.
 * 발송 채널은 전부 푸시(FCM)지만 본 PR 범위는 알림 저장·조회·읽음·설정 토글의 클라이언트 표현뿐.
 */

/** 알림 종류 — 아이콘/의미 구분 (필터 없음) */
export const notificationCategorySchema = z.enum(['order', 'refund', 'review', 'settlement', 'notice'])
export type NotificationCategory = z.infer<typeof notificationCategorySchema>

/** 알림 1건 (서버 저장 형태 흉내). createdAt=ISO(정렬·상대시각), link=딥링크 경로(없으면 null) */
export const notificationSchema = z.object({
  id: z.string(),
  category: notificationCategorySchema,
  icon: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  read: z.boolean(),
  link: z.string().nullable(),
})
export type Notification = z.infer<typeof notificationSchema>

export const notificationListSchema = z.array(notificationSchema)

/** 알림 설정 토글 키 (6종, 노션 「알림 설정(사장)」) */
export const notificationSettingKeySchema = z.enum([
  'newOrder',
  'orderCancel',
  'refundRequest',
  'newReview',
  'notice',
  'marketing',
])
export type NotificationSettingKey = z.infer<typeof notificationSettingKeySchema>

/** 설정 상태 = 키별 on/off (전체 키 고정) */
export const notificationSettingsSchema = z.object({
  newOrder: z.boolean(),
  orderCancel: z.boolean(),
  refundRequest: z.boolean(),
  newReview: z.boolean(),
  notice: z.boolean(),
  marketing: z.boolean(),
})
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
