import { useInfiniteQuery } from '@tanstack/react-query'
import { storeListApi } from '../api/storeListApi'
import { storeListKeys } from './storeListKeys'
import type { StoreSort } from '../types'

/** 전체 매장 무한 스크롤 — 정렬별 offset 페이지네이션. hasNext=false 면 마지막 페이지. */
export function useStoreList(sort: StoreSort) {
  return useInfiniteQuery({
    queryKey: storeListKeys.list(sort),
    queryFn: ({ pageParam }) => storeListApi.getStores({ sort, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  })
}
