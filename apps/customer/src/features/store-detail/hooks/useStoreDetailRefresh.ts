import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/** pull-to-refresh — 해당 매장의 상세/떨이/메뉴/리뷰 쿼리를 한 번에 무효화(재요청) */
export function useStoreDetailRefresh(storeId: number) {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['store', storeId] }),
    [queryClient, storeId],
  )
}
