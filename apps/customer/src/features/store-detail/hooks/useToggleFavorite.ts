import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'
import type { StoreDetail } from '../types'

/**
 * 단골 토글 — 즉시 반영(optimistic). 상세 쿼리 캐시의 isFavorite 를 먼저 뒤집고,
 * 실패 시 롤백. (BE 연동 시 onSettled 에서 invalidate 추가)
 */
export function useToggleFavorite(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (next: boolean) => storeDetailApi.toggleFavorite(id, next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['store', id] })
      const previous = queryClient.getQueryData<StoreDetail>(['store', id])
      if (previous) {
        queryClient.setQueryData<StoreDetail>(['store', id], { ...previous, isFavorite: next })
      }
      return { previous }
    },
    onError: (_err, _next, context) => {
      if (context?.previous) queryClient.setQueryData(['store', id], context.previous)
    },
  })
}
