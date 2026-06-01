import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'

/** 매장 리뷰 요약 — 평균·총개수·답글률 */
export function useReviewSummary(storeId: string) {
  return useQuery({
    queryKey: reviewKeys.summary(storeId),
    queryFn: () => reviewsApi.getReviewSummary(),
  })
}
