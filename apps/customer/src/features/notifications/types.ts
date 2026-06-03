import { z } from 'zod'

/**
 * 알림 (소비자) 도메인 타입 / Zod 스키마 — Phase 7: 알림 목록 조회(알림센터) · 알림 설정.
 *
 * 백엔드 `notification` 미구현 → mock. 개별 알림(떨이 등록·신규 주문·환불 완료·리뷰 답글·문의 답변
 * 등)은 별도 화면이 아니라 알림센터에 뜨는 **종류(category)** 로만 표현된다.
 * - 세그먼트 매핑: deal→마감 할인, order→주문, review·benefit·system→전체에만 노출.
 * - 발송 채널은 전부 푸시(FCM)지만, 본 PR 범위는 **알림 저장·조회·읽음·설정 토글**의 클라이언트
 *   표현뿐 (FCM 토큰 등록·실발송은 anchor 후속).
 */

/** 알림 종류 — 세그먼트 매핑 + 아이콘 결정의 단일 소스 */
export const notificationCategorySchema = z.enum(['deal', 'order', 'review', 'benefit', 'system'])
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
