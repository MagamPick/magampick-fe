import type { MapStoresParams } from '../types'

/** 지도 기반 매장 조회 쿼리 키 팩토리 (state-convention §3) */
export const mapKeys = {
  all: ['map'] as const,
  stores: (params: MapStoresParams) => [...mapKeys.all, 'stores', params] as const,
}
