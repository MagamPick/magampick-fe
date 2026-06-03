import { useQuery } from '@tanstack/react-query'
import type { StoreSort } from '@/features/store-list/types'
import { searchApi } from '../api/searchApi'
import { searchKeys } from './searchKeys'

/**
 * 키워드 검색 결과 — 제출된 검색어(q)가 있을 때만 조회. 정렬 변경 시 refetch(키에 sort 포함).
 * 결과 = 매장 섹션 + 상품 섹션.
 */
export function useKeywordSearch(q: string, sort: StoreSort) {
  return useQuery({
    queryKey: searchKeys.result(q, sort),
    queryFn: () => searchApi.search({ q, sort }),
    enabled: q.trim().length > 0,
  })
}
