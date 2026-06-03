import { useQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 매장 상세 (헤더/메타/정보 + 단골 여부) */
export function useStoreDetail(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => storeDetailApi.getStoreDetail(id),
  })
}
