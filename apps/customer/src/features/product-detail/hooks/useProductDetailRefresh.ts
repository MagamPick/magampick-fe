import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ProductKind } from '../types'

/** pull-to-refresh — 해당 상품 상세 쿼리를 무효화(재요청). 떨이 남은 개수·마감 갱신용 */
export function useProductDetailRefresh(kind: ProductKind, id: number) {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['product-detail', kind, id] }),
    [queryClient, kind, id],
  )
}
