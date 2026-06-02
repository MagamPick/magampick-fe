import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationKeys } from './notificationKeys'

/** 알림 설정 조회 (토글 6종 상태) */
export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: () => notificationsApi.getSettings(),
  })
}
