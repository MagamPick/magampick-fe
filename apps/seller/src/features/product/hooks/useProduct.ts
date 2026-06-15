import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/** 상품 단건 조회 (상세·수정 화면). storeId/id 유효하지 않으면 호출 안 함 */
export function useProduct(storeId: number | null, id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProduct(storeId!, id),
    enabled: storeId != null && storeId > 0 && Number.isFinite(id) && id > 0,
  })
}
