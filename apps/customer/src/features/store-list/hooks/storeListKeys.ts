import type { StoreSort } from '../types'

/** 전체 매장 조회 도메인 쿼리 키 팩토리 (state-convention §3) */
export const storeListKeys = {
  all: ['stores'] as const,
  lists: () => [...storeListKeys.all, 'list'] as const,
  list: (sort: StoreSort) => [...storeListKeys.lists(), { sort }] as const,
}
