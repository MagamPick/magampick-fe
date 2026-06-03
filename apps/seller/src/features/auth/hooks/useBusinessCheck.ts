import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/** 사업자등록번호 조회 — Step 5 [조회하기] 버튼에서 호출 (Mock: 앞 3자리 000 이면 실패) */
export function useBusinessCheck() {
  return useMutation({
    mutationFn: (input: { businessNumber: string; representativeName: string; openDate: string }) =>
      authApi.checkBusinessNumber(input),
  })
}
