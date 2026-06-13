import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inquiryApi } from '../api/inquiryApi'
import { inquiryKeys } from './inquiryKeys'

/**
 * 문의 답변 — 성공/실패 무관(onSettled) 목록 전체 무효화(필터·페이지 무관 재조회).
 * 동시성으로 409(이미 답변)·404(없음)가 떠도 서버 상태가 바뀐 것이므로 목록을 갱신해야 한다(§2-4).
 * 패널 전환·에러 메시지 표시는 호출 측 담당.
 */
export function useAnswerInquiry(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => inquiryApi.answerInquiry(id, content),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() })
    },
  })
}
