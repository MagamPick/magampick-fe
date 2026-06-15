import { useQuery } from '@tanstack/react-query'
import { reviewsApi, computeReviewSummary } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'

/**
 * 매장 리뷰 요약 — 평균·총개수·답글률.
 * list 와 동일 queryKey 사용 + select 파생 → 네트워크 1회(React Query 디덥).
 */
export function useReviewSummary(storeId: string) {
  return useQuery({
    queryKey: reviewKeys.list(storeId),
    queryFn: () => reviewsApi.listStoreReviews(storeId),
    enabled: !!storeId,
    select: computeReviewSummary,
  })
}
