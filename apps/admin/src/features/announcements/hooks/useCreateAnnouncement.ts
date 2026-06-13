import { useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementApi } from '../api/announcementApi'
import { announcementKeys } from './announcementKeys'
import type { AnnouncementCreatePayload } from '../types'

/** 공지 생성(즉시 발행) — 성공 시 목록 무효화. 모달 닫기/에러 표시는 호출 측 담당. */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AnnouncementCreatePayload) => announcementApi.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.list() })
    },
  })
}
