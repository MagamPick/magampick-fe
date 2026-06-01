import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'
import type { CreateReviewPayload } from '../types'

/** 리뷰 작성 — 성공 시 내 리뷰·완료주문 캐시 무효화(즉시 반영) */
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all })
    },
  })
}
