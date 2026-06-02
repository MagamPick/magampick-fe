import { useMutation } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'

/** 사업자 진위확인 — 매장 등록 폼 [조회하기] 버튼에서 호출 (Mock: 앞 3자리 000 이면 실패) */
export function useVerifyBusiness() {
  return useMutation({
    mutationFn: (input: { businessNumber: string; representativeName: string; openDate: string }) =>
      storeApi.checkBusinessNumber(input),
  })
}
