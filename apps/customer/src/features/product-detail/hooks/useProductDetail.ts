import { useQuery } from '@tanstack/react-query'
import { productDetailApi } from '../api/productDetailApi'
import type { ProductKind } from '../types'

/** 상품 상세 (일반/떨이 — kind+id 로 식별) */
export function useProductDetail(kind: ProductKind, id: string) {
  return useQuery({
    queryKey: ['product-detail', kind, id],
    queryFn: () => productDetailApi.getProductDetail(kind, id),
  })
}
