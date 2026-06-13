import { useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementApi } from '../api/announcementApi'
import { announcementKeys } from './announcementKeys'

/** 공지 삭제 — 성공 시 목록 무효화. confirm/에러 표시는 호출 측 담당. */
export function useDeleteAnnouncement(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => announcementApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.list() })
    },
  })
}
