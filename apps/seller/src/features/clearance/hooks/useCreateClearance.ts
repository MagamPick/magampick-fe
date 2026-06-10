import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '@/features/product/hooks/productKeys'
import { clearanceApi } from '../api/clearanceApi'
import { clearanceKeys } from './clearanceKeys'
import type { CreateClearancePayload } from '../types'

/**
 * 떨이 전환(등록) — 현재 매장(storeId)에 등록. 성공 시 떨이 목록 + 상품 목록 무효화.
 * (상품 목록은 🔥 마감 할인 진행중 배지가 갱신되어야 하므로 함께 무효화.)
 * 성공 후 화면 이동/토스트는 호출 측(위저드)이 담당.
 */
export function useCreateClearance(storeId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateClearancePayload) =>
      clearanceApi.createClearance(storeId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clearanceKeys.list(storeId) })
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
    },
  })
}
