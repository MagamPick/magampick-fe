import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 매장 영업시간 조회 (영업 요일 행만 — 휴무 요일은 없음) */
export function useBusinessHours(storeId: string) {
  return useQuery({
    queryKey: storeKeys.businessHours(storeId),
    queryFn: () => storeApi.getBusinessHours(storeId),
  })
}
