import { apiClient } from '@/shared/lib/axios'
import { storeListPageSchema, type StoreListPage, type StoreSort } from '../types'

/** 한 페이지에 가져올 매장 수 */
const PAGE_SIZE = 20

/**
 * 전체 매장 조회 API — 실 BE 연동.
 * GET /stores?sort=&page=&size= (인증 ROLE_CUSTOMER, apiClient Bearer 자동 첨부).
 * 기본 주소 미설정 시 BE 400 DEFAULT_ADDRESS_REQUIRED → ApiError 로 전파.
 */
export const storeListApi = {
  /** 5km 이내 매장 전체를 정렬 1종으로 (offset 페이지네이션). hasNext=false 면 마지막 페이지. */
  async getStores({
    sort,
    page = 0,
    size = PAGE_SIZE,
  }: {
    sort: StoreSort
    page?: number
    size?: number
  }): Promise<StoreListPage> {
    const res = await apiClient.get('/stores', { params: { sort, page, size } })
    return storeListPageSchema.parse(res.data)
  },
}
