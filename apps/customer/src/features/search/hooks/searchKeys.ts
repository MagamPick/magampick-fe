import type { StoreSort } from '@/features/store-list/types'

/** 검색 도메인 쿼리 키 팩토리 (state-convention §3) */
export const searchKeys = {
  all: ['search'] as const,
  /** 키워드 검색 결과 — 검색어 + 정렬별 (정렬 바뀌면 refetch) */
  result: (q: string, sort: StoreSort) => [...searchKeys.all, 'result', { q, sort }] as const,
  /** 자동완성 제안 — 입력어별 */
  suggestions: (q: string) => [...searchKeys.all, 'suggestions', { q }] as const,
}
