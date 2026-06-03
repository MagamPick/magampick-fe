import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { notificationKeys } from './notificationKeys'
import type { NotificationSettingKey, NotificationSettings } from '../types'

export interface UpdateSettingVars {
  key: NotificationSettingKey
  on: boolean
}

/**
 * 알림 설정 토글 — 낙관적 업데이트(스위치 즉시 반영) + 실패 시 롤백.
 * onSettled 에서 설정 쿼리만 invalidate (목록/뱃지와 무관).
 */
export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, on }: UpdateSettingVars) => notificationsApi.updateSetting(key, on),
    onMutate: async ({ key, on }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.settings() })
      const prev = queryClient.getQueryData<NotificationSettings>(notificationKeys.settings())
      if (prev) {
        queryClient.setQueryData<NotificationSettings>(notificationKeys.settings(), {
          ...prev,
          [key]: on,
        })
      }
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(notificationKeys.settings(), context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() })
    },
  })
}
