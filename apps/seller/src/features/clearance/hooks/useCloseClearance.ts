import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '@/features/product/hooks/productKeys'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'

/**
 * 떨이 수동 마감(조기 마감) — 활성 떨이를 즉시 CLOSED.
 * 성공 시 상세 + 떨이 목록 + 상품 목록(🔥 배지 제거) 무효화.
 */
export function useCloseClearance(id: string, storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearanceApi.closeClearance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clearanceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: clearanceKeys.list(storeId) })
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
    },
  })
}
