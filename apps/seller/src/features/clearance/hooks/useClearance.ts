import { useQuery } from '@tanstack/react-query'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'

/** 떨이 단건 조회 (상세·수정 화면). storeId/id 유효하지 않으면 호출 안 함 */
export function useClearance(storeId: number | null, id: number) {
  return useQuery({
    queryKey: clearanceKeys.detail(id),
    queryFn: () => clearanceApi.getClearance(storeId!, id),
    enabled: storeId != null && storeId > 0 && Number.isFinite(id) && id > 0,
  })
}
