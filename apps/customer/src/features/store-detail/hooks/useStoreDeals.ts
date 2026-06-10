import { useQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 마감 할인 탭 — 활성 떨이 목록 */
export function useStoreDeals(storeId: number) {
  return useQuery({
    queryKey: ['store', storeId, 'deals'],
    queryFn: () => storeDetailApi.getStoreDeals(storeId),
  })
}
