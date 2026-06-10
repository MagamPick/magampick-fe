import { useInfiniteQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/**
 * 리뷰 탭 — offset 무한 스크롤.
 * BE SliceResponse: hasNext=true면 다음 페이지(page+1) 있음.
 */
export function useStoreReviews(storeId: number) {
  return useInfiniteQuery({
    queryKey: ['store', storeId, 'reviews'],
    queryFn: ({ pageParam }) => storeDetailApi.getStoreReviews(storeId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  })
}
