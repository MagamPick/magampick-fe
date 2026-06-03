import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '../api/supportApi'
import type { InquiryInput } from '../types'
import { supportKeys } from './supportKeys'

/** 1:1 문의 제출 — 성공 시 내 문의 내역 무효화(대기 1건 반영) */
export function useSubmitInquiry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InquiryInput) => supportApi.submitInquiry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.inquiries() })
    },
  })
}
