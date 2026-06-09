import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'

/** 주소 삭제 — DELETE /customers/me/addresses/:id (id: number). 성공 시 목록 무효화 */
export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => addressesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
