import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/** 상품 단건 조회 (상세·수정 화면). id 없으면 호출 안 함 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  })
}
