import { useQuery } from '@tanstack/react-query'
import { eventApi } from '../api/eventApi'
import { eventKeys } from './eventKeys'

/** 이벤트(쿠폰) 목록 — 생성 최신순. */
export function useEvents() {
  return useQuery({
    queryKey: eventKeys.list(),
    queryFn: () => eventApi.listEvents(),
  })
}
