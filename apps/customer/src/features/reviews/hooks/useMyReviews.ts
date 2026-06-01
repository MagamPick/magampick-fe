import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'

/** 내가 쓴 리뷰 목록 (최신순) */
export function useMyReviews() {
  return useQuery({
    queryKey: reviewKeys.myList(),
    queryFn: () => reviewsApi.listMyReviews(),
  })
}
