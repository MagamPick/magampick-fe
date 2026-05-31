import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'
import type { UpdateAddressInput } from '../types'

/** 주소 수정 (별칭·상세주소만 — 도로명·좌표 불변) — 성공 시 목록 무효화 */
export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAddressInput }) =>
      addressesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
