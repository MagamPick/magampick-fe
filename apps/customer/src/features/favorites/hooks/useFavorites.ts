import { useQuery } from '@tanstack/react-query'
import { favoritesApi } from '../api/favoritesApi'
import { favoriteKeys } from './favoriteKeys'

/** 본인 단골매장 목록 + 상단 통계 (떨이 우선 정렬, BE) */
export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: () => favoritesApi.list(),
  })
}
