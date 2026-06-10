import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import type { StoreSort } from '@/features/store-list/types'
import {
  searchResultSchema,
  searchSuggestionSchema,
  type SearchResult,
  type SearchSuggestion,
} from '../types'

/**
 * 키워드 검색 · 자동완성 API — 실 BE 연동.
 * GET /search?q=&sort= → SearchResultResponse (Zod 검증).
 * GET /search/autocomplete?q= → SearchSuggestionResponse[] (Zod 검증).
 * 노출 범위(기본 주소지 5km·OPEN·오늘 영업)·정렬·유사도는 BE/DB 책임.
 */
export const searchApi = {
  /** 키워드 검색. 매장 섹션 + 상품 섹션 전량 반환(5km 한정 → 페이지네이션 없음). */
  async search({ q, sort }: { q: string; sort: StoreSort }): Promise<SearchResult> {
    const res = await apiClient.get('/search', { params: { q, sort } })
    return searchResultSchema.parse(res.data)
  },

  /** 자동완성. 입력 q 에 대한 매장명·상품명 제안 배열. */
  async autocomplete({ q }: { q: string }): Promise<SearchSuggestion[]> {
    const res = await apiClient.get('/search/autocomplete', { params: { q } })
    return z.array(searchSuggestionSchema).parse(res.data)
  },
}
