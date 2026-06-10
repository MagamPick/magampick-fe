import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { closingDealSchema, neighborhoodStoreSchema, type ClosingDeal, type NeighborhoodStore } from '../types'

/**
 * 홈 피드 API — 실 BE 연동.
 * apiClient 인터셉터가 envelope({success,data}) 를 자동 unwrap → res.data = DTO.
 * 에러는 normalizeError → ApiError {status, code, message} 로 정규화.
 */

export const homeApi = {
  /**
   * 마감 임박 특가 — 60분 이내·상위 5개는 BE 가 이미 필터·정렬.
   * GET /clearance-items/closing-soon
   */
  async getClosingDeals(): Promise<ClosingDeal[]> {
    const res = await apiClient.get('/clearance-items/closing-soon')
    return z.array(closingDealSchema).parse(res.data)
  },

  /**
   * 우리 동네 마감픽 — 5km·OPEN·단골제외·추천정렬·최대6개 BE 처리.
   * GET /stores/neighborhood
   */
  async getNeighborhoodStores(): Promise<NeighborhoodStore[]> {
    const res = await apiClient.get('/stores/neighborhood')
    return z.array(neighborhoodStoreSchema).parse(res.data)
  },
}
