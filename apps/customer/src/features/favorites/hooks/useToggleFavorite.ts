import { useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api/favoritesApi'
import { favoriteKeys } from './favoriteKeys'
import type { FavoriteList, FavoriteStore } from '../types'

export interface ToggleFavoriteVars {
  /** BE number storeId (#6 매장 상세 실연동 시 storeId 출처) */
  storeId: number
  /** true=추가, false=해제 */
  next: boolean
  /** 추가 시 목록 optimistic 삽입용 카드. 없으면 invalidate refetch 로 반영. */
  store?: FavoriteStore
}

/** 단골 토글에서 함께 패치하는 매장 상세 캐시의 최소 형태 */
type StoreFavoriteCache = { isFavorite: boolean }

/**
 * 단골 추가/해제 — 매장 상세·홈·단골 목록 공용 단일 토글.
 * optimistic: 매장 상세 캐시 isFavorite 즉시 반영 + 단골 목록 즉시 반영(해제=제거·통계 보정,
 * 추가=카드 제공 시 삽입). 실패 시 롤백(호출부 onError 로 상한 등 안내). onSettled 에서
 * 단골 목록·홈·해당 매장 상세를 invalidate 해 서버 정렬·통계로 정합화.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ storeId, next }: ToggleFavoriteVars) =>
      next ? favoritesApi.add(storeId) : favoritesApi.remove(storeId),
    onMutate: async ({ storeId, next, store }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.list() })
      await queryClient.cancelQueries({ queryKey: ['store', storeId] })

      const prevList = queryClient.getQueryData<FavoriteList>(favoriteKeys.list())
      const prevStore = queryClient.getQueryData<StoreFavoriteCache>(['store', storeId])

      if (prevStore) {
        queryClient.setQueryData(['store', storeId], { ...prevStore, isFavorite: next })
      }

      if (prevList) {
        if (!next) {
          const removed = prevList.stores.find((s) => s.id === storeId)
          queryClient.setQueryData<FavoriteList>(favoriteKeys.list(), {
            stores: prevList.stores.filter((s) => s.id !== storeId),
            totalCount: prevList.totalCount - (removed ? 1 : 0),
            totalActiveDealCount: prevList.totalActiveDealCount - (removed?.activeDealCount ?? 0),
          })
        } else if (store && !prevList.stores.some((s) => s.id === storeId)) {
          queryClient.setQueryData<FavoriteList>(favoriteKeys.list(), {
            stores: [...prevList.stores, store],
            totalCount: prevList.totalCount + 1,
            totalActiveDealCount: prevList.totalActiveDealCount + store.activeDealCount,
          })
        }
      }

      return { prevList, prevStore }
    },
    onError: (_err, { storeId }, context) => {
      if (context?.prevList) queryClient.setQueryData(favoriteKeys.list(), context.prevList)
      if (context?.prevStore) queryClient.setQueryData(['store', storeId], context.prevStore)
    },
    onSettled: (_data, _err, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
      queryClient.invalidateQueries({ queryKey: ['home'] })
      queryClient.invalidateQueries({ queryKey: ['store', storeId] })
      // 전체 매장 조회 카드의 단골 뱃지도 정합화 (store-list)
      queryClient.invalidateQueries({ queryKey: ['stores', 'list'] })
    },
  })
}
