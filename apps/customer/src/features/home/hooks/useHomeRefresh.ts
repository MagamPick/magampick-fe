import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/** pull-to-refresh — 홈 3섹션 쿼리를 한 번에 무효화(재요청). 자동 폴링은 안 함. */
export function useHomeRefresh() {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['home'] }),
    [queryClient],
  )
}
