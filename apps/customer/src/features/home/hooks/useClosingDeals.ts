import { useQuery } from '@tanstack/react-query'
import { homeApi } from '../api/homeApi'

/** ① 마감 임박 특가 (5km 이내·픽업 60분 이내, BE 정렬) */
export function useClosingDeals() {
  return useQuery({
    queryKey: ['home', 'closing-deals'],
    queryFn: () => homeApi.getClosingDeals(),
  })
}
