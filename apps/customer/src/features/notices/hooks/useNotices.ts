import { useQuery } from '@tanstack/react-query'
import { noticeApi } from '../api/noticeApi'
import { noticeKeys } from './noticeKeys'

/** 발행된 공지 목록 (핀 우선·최신순) */
export function useNotices() {
  return useQuery({
    queryKey: noticeKeys.list(),
    queryFn: () => noticeApi.listNotices(),
  })
}
