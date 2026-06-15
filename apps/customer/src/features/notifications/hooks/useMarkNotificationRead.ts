import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationKeys } from './notificationKeys'

/** 단건 읽음 처리 — 목록·미읽음 뱃지 정합화 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
