import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'

/** 기본 주소 전환 — POST /customers/me/addresses/:id/default (id: number). 성공 시 목록 무효화 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => addressesApi.setDefault(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
