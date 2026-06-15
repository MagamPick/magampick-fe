import { useQuery } from '@tanstack/react-query'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'

/** 현재 매장의 떨이 목록 조회 (등록 최신순). storeId null 이면 쿼리 비활성. */
export function useClearances(storeId: number | null) {
  return useQuery({
    queryKey: clearanceKeys.list(storeId),
    queryFn: () => clearanceApi.listClearances(storeId!),
    enabled: storeId != null && storeId > 0,
  })
}
