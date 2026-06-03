import { useQuery } from '@tanstack/react-query'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'

/** 떨이 단건 조회 (상세·수정 화면). id 없으면 호출 안 함 */
export function useClearance(id: string) {
  return useQuery({
    queryKey: clearanceKeys.detail(id),
    queryFn: () => clearanceApi.getClearance(id),
    enabled: !!id,
  })
}
