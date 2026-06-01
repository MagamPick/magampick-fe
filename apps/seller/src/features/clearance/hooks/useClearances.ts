import { useQuery } from '@tanstack/react-query'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'

/** 현재 매장의 떨이 목록 조회 (등록 최신순, 참조 상품 join) */
export function useClearances(storeId: string) {
  return useQuery({
    queryKey: clearanceKeys.list(storeId),
    queryFn: () => clearanceApi.listClearances(storeId),
  })
}
