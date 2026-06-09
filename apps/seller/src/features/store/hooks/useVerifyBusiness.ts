import { useMutation } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'

/**
 * 사업자 진위확인 — 매장 등록 폼 [조회하기] 버튼에서 호출.
 * POST /seller/stores/business-verification → 204 No Content (void).
 * 성공 시 호출 측에서 bizVerified = true 로 설정.
 */
export function useVerifyBusiness() {
  return useMutation({
    mutationFn: (input: { businessNumber: string; representativeName: string; openDate: string }) =>
      storeApi.checkBusinessNumber(input),
  })
}
