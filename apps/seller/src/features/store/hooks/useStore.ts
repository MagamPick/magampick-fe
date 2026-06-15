import { useQuery } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'

/** 매장 상세 조회 — 정보 수정 폼 미리채움 source (5필드 + id). storeId null이면 호출 안 함 */
export function useStore(storeId: number | null) {
  return useQuery({
    queryKey: storeId != null ? storeKeys.detail(storeId) : [...storeKeys.all, 'no-store', 'detail'],
    queryFn: () => storeApi.getStore(storeId!),
    enabled: storeId != null,
  })
}
