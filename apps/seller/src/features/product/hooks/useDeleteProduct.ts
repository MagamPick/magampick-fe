import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearanceKeys } from '@/features/clearance/hooks/clearanceKeys'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'

/**
 * 상품 삭제(soft delete) — 상품을 삭제한다.
 * BE가 cascade로 진행중 떨이를 자동마감하므로 FE에서 별도 마감 호출 불필요.
 * 성공 시 매장 상품 목록 + 떨이 목록 무효화.
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
