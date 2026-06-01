import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'

/** 리뷰 답글 작성 — 성공 시 리뷰 목록·요약 무효화(답글률 갱신). 중복 답글은 API 가 거부 */
export function useReplyToReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
      reviewsApi.replyToReview(reviewId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all })
    },
  })
}
