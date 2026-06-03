import { useQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 리뷰 탭 상단 — 평균 평점 + 별점 분포 */
export function useReviewSummary(id: string) {
  return useQuery({
    queryKey: ['store', id, 'review-summary'],
    queryFn: () => storeDetailApi.getReviewSummary(id),
  })
}
