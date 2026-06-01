import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearanceApi } from '@/features/clearance/api/clearanceApi'
import { clearanceKeys } from '@/features/clearance/hooks/clearanceKeys'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/**
 * 상품 삭제(soft delete) — 진행 중인 떨이를 먼저 자동 마감한 뒤 상품을 삭제 (노션).
 * 성공 시 매장 상품 목록 + 떨이 목록 무효화.
 */
export function useDeleteProduct(id: string, storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await clearanceApi.closeActiveByProduct(id)
      await productApi.deleteProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
      queryClient.invalidateQueries({ queryKey: clearanceKeys.list(storeId) })
    },
  })
}
