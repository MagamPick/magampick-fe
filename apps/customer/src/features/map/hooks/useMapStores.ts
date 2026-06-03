import { useQuery } from '@tanstack/react-query'
import { mapApi } from '../api/mapApi'
import { mapKeys } from './mapKeys'
import type { MapStoresParams } from '../types'

/**
 * 지도 마커 데이터 — 중심 좌표·반경·마감 할인 토글별 매장. 변경 즉시 마커 갱신(별도 "적용" 버튼 X).
 * params=null(좌표 준비 전)이면 fetch 보류(enabled:false). 노션: "변경 즉시 마커 갱신".
 */
export function useMapStores(params: MapStoresParams | null) {
  return useQuery({
    queryKey: params ? mapKeys.stores(params) : mapKeys.all,
    queryFn: () => mapApi.getMapStores(params!),
    enabled: params !== null,
  })
}
