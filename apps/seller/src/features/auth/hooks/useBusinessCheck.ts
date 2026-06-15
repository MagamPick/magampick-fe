import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/** 사업자등록번호 진위확인 — Step 5 [조회하기] 버튼에서 호출 (BE 국세청 조회, 불일치/형식오류는 ApiError) */
export function useBusinessCheck() {
  return useMutation({
    mutationFn: (input: { businessNumber: string; representativeName: string; openDate: string }) =>
      authApi.checkBusinessNumber(input),
  })
}
