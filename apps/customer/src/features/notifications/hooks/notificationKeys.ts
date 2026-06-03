import type { NotificationSegment } from '../types'

/** 알림 도메인 쿼리 키 팩토리 (state-convention §3) */
export const notificationKeys = {
  all: ['notifications'] as const,
  /** 알림 목록 — 세그먼트별 */
  list: (segment: NotificationSegment) => [...notificationKeys.all, 'list', { segment }] as const,
  /** 미읽음 수 — 헤더 뱃지 */
  unread: () => [...notificationKeys.all, 'unread'] as const,
  /** 알림 설정 */
  settings: () => [...notificationKeys.all, 'settings'] as const,
}
