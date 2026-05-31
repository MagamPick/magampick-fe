import { useInfiniteQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 리뷰 탭 — 무한 스크롤 (커서 페이지네이션). nextCursor null 이면 마지막 페이지 */
export function useStoreReviews(id: string) {
  return useInfiniteQuery({
    queryKey: ['store', id, 'reviews'],
    queryFn: ({ pageParam }) => storeDetailApi.getStoreReviews(id, { cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
