import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 매장별 영업 상태 — storeId null이면 호출 안 함 */
export function useStoreStatus(storeId: number | null) {
  return useQuery({
    queryKey: storeId != null ? storeKeys.status(storeId) : [...storeKeys.all, 'no-store', 'status'],
    queryFn: () => storeApi.getStoreStatus(storeId!),
    enabled: storeId != null,
  })
}
