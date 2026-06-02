import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationKeys } from './notificationKeys'

/** 전체 읽음 처리 ([모두 읽음]) — 목록·미읽음 뱃지 정합화 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
