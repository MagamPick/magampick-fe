import { useQuery } from '@tanstack/react-query'
import { homeApi } from '../api/homeApi'

/** ③ 우리 동네 마감픽 (5km 이내·단골 제외, 룰 스코어링 상위 6 고정 프리뷰) */
export function useNeighborhoodStores() {
  return useQuery({
    queryKey: ['home', 'neighborhood'],
    queryFn: () => homeApi.getNeighborhoodStores(),
  })
}
