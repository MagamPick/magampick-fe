import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'
import type { CreateStoreInput } from '../types'

/**
 * 매장 등록 (경로 B) — 자동 승인 후 보유 매장 목록을 무효화(즉시 반영).
 * 성공 후 현재 매장 선택·화면 이동은 호출 측(폼)이 담당.
 */
export function useCreateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateStoreInput) => storeApi.createStore(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.list() })
    },
  })
}
