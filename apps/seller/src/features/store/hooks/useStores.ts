import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 보유 매장 목록 — 헤더 매장 선택기용 */
export function useStores() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: () => storeApi.getStores(),
  })
}
