import { apiClient } from '@/shared/lib/axios'
import { mapStoreSchema, type MapStore, type MapStoresParams } from '../types'

/**
 * 지도 기반 매장 조회 API — 실 BE 연동.
 * GET /stores/map?latitude=&longitude=&radiusKm=&dealsOnly= (인증 ROLE_CUSTOMER).
 * radiusKm 은 1/3/5 만 허용 (그 외 BE 400 INVALID_INPUT).
 * 노션: 운영상태(OPEN+영업요일)·반경·거리는 BE PostGIS 처리 → FE 는 "이미 필터된" 응답 렌더만.
 */
export const mapApi = {
  /** 중심 좌표 기준 반경 안의 매장 마커. dealsOnly=true 면 활성 떨이 보유 매장만. */
  async getMapStores({
    latitude,
    longitude,
    radiusKm,
    dealsOnly,
  }: MapStoresParams): Promise<MapStore[]> {
    const res = await apiClient.get('/stores/map', {
      params: { latitude, longitude, radiusKm, dealsOnly },
    })
    return mapStoreSchema.array().parse(res.data)
  },
}
