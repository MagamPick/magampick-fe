import { useQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 마감 할인 탭 — 활성 떨이 목록 */
export function useStoreDeals(id: string) {
  return useQuery({
    queryKey: ['store', id, 'deals'],
    queryFn: () => storeDetailApi.getStoreDeals(id),
  })
}
