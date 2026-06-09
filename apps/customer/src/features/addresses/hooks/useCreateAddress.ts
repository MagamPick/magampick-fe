import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'
import type { CreateAddressInput } from '../types'

/** 주소 추가 — POST /customers/me/addresses. 성공 시 목록 무효화 */
export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAddressInput) => addressesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
