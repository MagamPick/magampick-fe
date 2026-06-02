/** 알림 도메인 쿼리 키 팩토리 (state-convention §3) — 사장 센터는 세그먼트 없음 */
export const notificationKeys = {
  all: ['notifications'] as const,
  /** 알림 목록 (단일 리스트) */
  list: () => [...notificationKeys.all, 'list'] as const,
  /** 미읽음 수 — 헤더 뱃지 */
  unread: () => [...notificationKeys.all, 'unread'] as const,
  /** 알림 설정 */
  settings: () => [...notificationKeys.all, 'settings'] as const,
}
