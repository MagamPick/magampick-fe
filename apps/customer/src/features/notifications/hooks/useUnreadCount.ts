import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationKeys } from './notificationKeys'

/** 미읽음 알림 수 — 홈 헤더 종 뱃지 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsApi.unreadCount(),
  })
}
