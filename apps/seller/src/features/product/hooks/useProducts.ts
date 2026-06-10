import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/** 현재 매장의 일반 상품 목록 조회 (등록 최신순). storeId null 이면 쿼리 비활성. */
export function useProducts(storeId: number | null) {
  return useQuery({
    queryKey: productKeys.list(storeId),
    queryFn: () => productApi.listProducts(storeId!),
    enabled: storeId != null && storeId > 0,
  })
}
