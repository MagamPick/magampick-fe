import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 매장 영업시간 조회 (영업 요일 행만 — 휴무 요일은 없음). storeId null이면 호출 안 함 */
export function useBusinessHours(storeId: number | null) {
  return useQuery({
    queryKey:
      storeId != null
        ? storeKeys.businessHours(storeId)
        : [...storeKeys.all, 'no-store', 'businessHours'],
    queryFn: () => storeApi.getBusinessHours(storeId!),
    enabled: storeId != null,
  })
}
