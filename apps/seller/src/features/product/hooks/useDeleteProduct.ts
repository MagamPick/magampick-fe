import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearanceKeys } from '@/features/clearance/hooks/clearanceKeys'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/**
 * 상품 삭제(soft delete) — 상품을 삭제한다.
 * 진행 중(OPEN) 떨이가 있으면 BE가 409("진행 중인 떨이 존재")로 차단한다. cascade 마감 없음.
 * 성공 시 매장 상품 목록 + 떨이 목록 무효화(방어적 무효화).
 */
export function useDeleteProduct(id: number, storeId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => productApi.deleteProduct(storeId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
      queryClient.invalidateQueries({ queryKey: clearanceKeys.list(storeId) })
    },
  })
}
