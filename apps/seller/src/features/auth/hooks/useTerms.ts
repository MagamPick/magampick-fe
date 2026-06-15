import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { authKeys } from './authKeys'

/** 사장 약관 목록 (GET /terms?role=SELLER) — 가입 Step 1 에서 캐시 후 재사용 */
export function useTerms() {
  return useQuery({
    queryKey: authKeys.terms(),
    queryFn: () => authApi.listTerms(),
  })
}
