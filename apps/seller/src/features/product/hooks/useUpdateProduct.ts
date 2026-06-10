import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'
import type { UpdateProductPayload } from '../types'

/**
 * 상품 수정 — 성공 시 상세 + 매장 상품 목록 무효화(즉시 반영).
 * 성공 후 화면 이동은 호출 측(폼)이 담당.
 */
export function useUpdateProduct(id: number, storeId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProductPayload) =>
      productApi.updateProduct(storeId!, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
    },
  })
}
