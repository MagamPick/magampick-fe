import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviewsApi'
import { reviewKeys } from './reviewKeys'

/** 자기 매장 리뷰 목록 */
export function useStoreReviews(storeId: string) {
  return useQuery({
    queryKey: reviewKeys.list(storeId),
    queryFn: () => reviewsApi.listStoreReviews(),
  })
}
