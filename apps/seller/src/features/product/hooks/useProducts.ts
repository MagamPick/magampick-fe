import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/** 현재 매장의 일반 상품 목록 조회 (등록 최신순) */
export function useProducts(storeId: string) {
  return useQuery({
    queryKey: productKeys.list(storeId),
    queryFn: () => productApi.listProducts(storeId),
  })
}
