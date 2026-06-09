import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'
import type { UpdateAddressInput } from '../types'

/** 주소 수정 — PATCH /customers/me/addresses/:id (id: number). 성공 시 목록 무효화 */
export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAddressInput }) =>
      addressesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
