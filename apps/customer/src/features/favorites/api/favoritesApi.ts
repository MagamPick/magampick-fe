import { apiClient } from '@/shared/lib/axios'
import { favoriteListSchema, type FavoriteList } from '../types'

/**
 * 단골매장 API — 실 BE 연동 (GET/POST/DELETE /customers/me/favorites).
 *
 * apiClient 인터셉터가 envelope({success,data}) 를 자동 unwrap → res.data = DTO.
 * 에러는 normalizeError → ApiError {status, code, message} 로 정규화.
 * BE 409 FAVORITE_LIMIT_REACHED 는 favoriteErrorMessage 에서 사용자 안내.
 * 참고 구현: apps/customer/src/features/profile/api/profileApi.ts
 */

export const favoritesApi = {
  /** 본인 단골매장 목록 + 상단 통계. BE 정렬(떨이 활성 우선 → 등록순) 결과 그대로 반환. */
  async list(): Promise<FavoriteList> {
    const res = await apiClient.get('/customers/me/favorites')
    return favoriteListSchema.parse(res.data)
  },

  /**
   * 단골 추가 — idempotent(이미 등록된 매장도 201).
   * BE 가 409 FAVORITE_LIMIT_REACHED 반환 시 ApiError 로 throw (호출부에서 처리).
   */
  async add(storeId: number): Promise<void> {
    await apiClient.post('/customers/me/favorites', { storeId })
  },

  /** 단골 해제 — idempotent(미등록 매장도 204). */
  async remove(storeId: number): Promise<void> {
    await apiClient.delete(`/customers/me/favorites/${storeId}`)
  },
}
