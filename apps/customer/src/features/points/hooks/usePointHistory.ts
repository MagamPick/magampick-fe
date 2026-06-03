import { useQuery } from '@tanstack/react-query'
import { pointApi } from '../api/pointApi'
import type { PointHistoryFilter } from '../types'
import { pointKeys } from './pointKeys'

/** 포인트 내역 조회 — 탭 필터(전체/적립/사용), 최신순 */
export function usePointHistory(filter: PointHistoryFilter) {
  return useQuery({
    queryKey: pointKeys.history(filter),
    queryFn: () => pointApi.listHistory(filter),
  })
}
