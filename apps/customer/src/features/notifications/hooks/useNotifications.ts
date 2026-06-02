import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationKeys } from './notificationKeys'
import type { NotificationSegment } from '../types'

/** 알림 목록 조회 — 세그먼트별 (전체/마감 할인/주문) */
export function useNotifications(segment: NotificationSegment) {
  return useQuery({
    queryKey: notificationKeys.list(segment),
    queryFn: () => notificationsApi.list(segment),
  })
}
