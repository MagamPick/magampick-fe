import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '../api/productApi'
import { productKeys } from './productKeys'
import type { CreateProductPayload } from '../types'

/** 폼이 만드는 상품 필드 — storeId 는 훅이 현재 매장으로 주입 */
export type CreateProductFields = Omit<CreateProductPayload, 'storeId'>

/**
 * 상품 등록 — 현재 매장(storeId)에 등록하고 성공 시 해당 매장 상품 목록을 무효화(즉시 반영).
 * 성공 후 화면 이동은 호출 측(폼)이 담당.
 */
export function useCreateProduct(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fields: CreateProductFields) => productApi.createProduct({ ...fields, storeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(storeId) })
    },
  })
}
