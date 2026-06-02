import { useQuery } from '@tanstack/react-query'
import { supportApi } from '../api/supportApi'
import { supportKeys } from './supportKeys'

/** 문의 상세 — id 없으면 비활성 */
export function useInquiry(id: string) {
  return useQuery({
    queryKey: supportKeys.inquiry(id),
    queryFn: () => supportApi.getInquiry(id),
    enabled: !!id,
  })
}
