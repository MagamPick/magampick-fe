import { useQuery } from '@tanstack/react-query'
import { announcementApi } from '../api/announcementApi'
import { announcementKeys } from './announcementKeys'

/** 공지 목록 — 핀 우선·최신순. */
export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.list(),
    queryFn: () => announcementApi.listAnnouncements(),
  })
}
