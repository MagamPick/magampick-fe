import { useQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 매장 상세 (헤더/메타/정보 + 단골 여부). storeId = BE number. */
export function useStoreDetail(storeId: number) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storeDetailApi.getStoreDetail(storeId),
  })
}
