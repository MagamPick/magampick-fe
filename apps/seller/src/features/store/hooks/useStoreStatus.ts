import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 매장별 영업 상태 — storeId 없으면 호출 안 함 */
export function useStoreStatus(storeId: string | null) {
  return useQuery({
    queryKey: storeKeys.status(storeId ?? ''),
    queryFn: () => storeApi.getStoreStatus(storeId as string),
    enabled: !!storeId,
  })
}
