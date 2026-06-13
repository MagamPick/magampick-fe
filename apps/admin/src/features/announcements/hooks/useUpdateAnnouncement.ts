import { useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementApi } from '../api/announcementApi'
import { announcementKeys } from './announcementKeys'
import type { AnnouncementUpdatePayload } from '../types'

/** 공지 수정 — 성공 시 목록 무효화. */
export function useUpdateAnnouncement(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AnnouncementUpdatePayload) =>
      announcementApi.updateAnnouncement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.list() })
    },
  })
}
