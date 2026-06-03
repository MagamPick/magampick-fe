import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 매장 상세 조회 — 정보 수정 폼 미리채움 source (5필드 + id) */
export function useStore(storeId: string) {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => storeApi.getStore(storeId),
  })
}
