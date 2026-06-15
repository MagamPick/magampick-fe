import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '@/features/product/hooks/productKeys'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'
import type { UpdateClearancePayload } from '../types'

/**
 * 떨이 수정 — 활성 떨이의 할인가·등록 수량·픽업 마감 변경.
 * 성공 시 상세 + 떨이 목록 무효화. 남은 수량 0(→품절)은 상품 배지에도 영향 → 상품 목록도 무효화.
 */
export function useUpdateClearance(id: number, storeId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateClearancePayload) =>
      clearanceApi.updateClearance(storeId!, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clearanceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: clearanceKeys.list(storeId) })
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
    },
  })
}
