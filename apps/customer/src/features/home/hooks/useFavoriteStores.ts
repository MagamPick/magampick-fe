import { useQuery } from '@tanstack/react-query'
import { homeApi } from '../api/homeApi'

/** ② 단골 가게 (5km 이내, 활성 떨이 보유 우선, BE 정렬) */
export function useFavoriteStores() {
  return useQuery({
    queryKey: ['home', 'favorite-stores'],
    queryFn: () => homeApi.getFavoriteStores(),
  })
}
