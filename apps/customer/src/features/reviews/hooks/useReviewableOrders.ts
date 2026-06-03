import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'

/** 리뷰 작성 대상 완료주문 목록 (주문 탭에서 작성 진입) */
export function useReviewableOrders() {
  return useQuery({
    queryKey: reviewKeys.reviewableOrders(),
    queryFn: () => reviewsApi.listReviewableOrders(),
  })
}
