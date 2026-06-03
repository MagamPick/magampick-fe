import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { storeListKeys } from './storeListKeys'

/** pull-to-refresh — 전체 매장 목록(정렬 무관 전부)을 무효화(재요청). 자동 폴링 X. */
export function useStoreListRefresh() {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: storeListKeys.lists() }),
    [queryClient],
  )
}
