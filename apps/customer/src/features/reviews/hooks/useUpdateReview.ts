import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'
import type { UpdateReviewPayload } from '../types'

/** 리뷰 수정 — reviewId 고정, 성공 시 캐시 무효화 (답글 달린 리뷰는 API 가 거부) */
export function useUpdateReview(reviewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateReviewPayload) => reviewsApi.updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all })
    },
  })
}
