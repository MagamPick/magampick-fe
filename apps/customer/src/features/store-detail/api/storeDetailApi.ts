import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import {
  storeDetailSchema,
  storeDealSchema,
  storeMenuItemSchema,
  reviewSummarySchema,
  storeReviewPageSchema,
  type StoreDetail,
  type StoreDeal,
  type StoreMenuItem,
  type ReviewSummary,
  type StoreReviewPage,
} from '../types'

/**
 * 매장 상세 API — 실 BE 연동.
 * apiClient 인터셉터가 envelope({success,data}) 를 자동 unwrap → res.data = DTO.
 * 에러는 normalizeError → ApiError {status, code, message} 로 정규화.
 */
export const storeDetailApi = {
  /** 매장 상세 (헤더/메타/정보/지도). storeId = BE number. 404 STORE_NOT_FOUND 등 propagate. */
  async getStoreDetail(storeId: number): Promise<StoreDetail> {
    const res = await apiClient.get(`/stores/${storeId}`)
    return storeDetailSchema.parse(res.data)
  },

  /** 마감 할인 탭 — 활성 떨이 목록 (public). 빈 배열 = 진행 중 없음. */
  async getStoreDeals(storeId: number): Promise<StoreDeal[]> {
    const res = await apiClient.get(`/stores/${storeId}/clearance-items`)
    return z.array(storeDealSchema).parse(res.data)
  },

  /** 메뉴 탭 — 판매 ON 일반 상품 목록 (public). 빈 배열 = 등록 없음. */
  async getStoreMenu(storeId: number): Promise<StoreMenuItem[]> {
    const res = await apiClient.get(`/stores/${storeId}/menu`)
    return z.array(storeMenuItemSchema).parse(res.data)
  },

  /** 리뷰 탭 상단 — 평균 평점 + 별점 분포. 리뷰 0건이면 average=0. */
  async getReviewSummary(storeId: number): Promise<ReviewSummary> {
    const res = await apiClient.get(`/stores/${storeId}/reviews/summary`)
    return reviewSummarySchema.parse(res.data)
  },

  /**
   * 리뷰 탭 — offset 페이지네이션 (SliceResponse).
   * BE: { content, page, size, hasNext } → transform → { items, page, size, hasNext }.
   */
  async getStoreReviews(
    storeId: number,
    { page = 0 }: { page?: number } = {},
  ): Promise<StoreReviewPage> {
    const res = await apiClient.get(`/stores/${storeId}/reviews`, {
      params: { page, size: 10 },
    })
    return storeReviewPageSchema.parse(res.data)
  },
}
