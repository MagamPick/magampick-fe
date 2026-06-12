import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analyticsApi'
import { analyticsKeys } from './analyticsKeys'
import type { AnalyticsPeriod } from '../types'

/** 현재 선택 매장·기간의 통계 조회 (노션 「사장 통계 대시보드」). */
export function useAnalytics(storeId: string, period: AnalyticsPeriod) {
  return useQuery({
    queryKey: analyticsKeys.detail(storeId, period),
    queryFn: () => analyticsApi.getAnalytics(storeId, period),
    enabled: !!storeId,
  })
}
