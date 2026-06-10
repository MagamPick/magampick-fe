import { apiClient } from '@/shared/lib/axios'
import {
  menuProductDetailSchema,
  dealProductDetailSchema,
  type ProductDetail,
  type ProductKind,
} from '../types'

/**
 * 상품 상세 API — 실 BE 연동 (2 엔드포인트, kind 로 분기).
 * - 일반(menu): GET /products/{productId}
 * - 떨이(deal): GET /clearance-items/{clearanceItemId}
 * apiClient 인터셉터가 envelope({success,data}) 를 자동 unwrap → res.data = DTO.
 */
export const productDetailApi = {
  async getProductDetail(kind: ProductKind, id: number): Promise<ProductDetail> {
    if (kind === 'menu') {
      const res = await apiClient.get(`/products/${id}`)
      return menuProductDetailSchema.parse(res.data)
    } else {
      const res = await apiClient.get(`/clearance-items/${id}`)
      return dealProductDetailSchema.parse(res.data)
    }
  },
}
