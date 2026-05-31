import { useQuery } from '@tanstack/react-query'
import { homeApi } from '../api/homeApi'

/** 헤더에 표시할 기본 주소지 라벨 (피드 기준점). 세션 중 거의 안 변하므로 길게 캐시. */
export function useHomeAddress() {
  return useQuery({
    queryKey: ['home', 'address'],
    queryFn: () => homeApi.getHomeAddress(),
    staleTime: Infinity,
  })
}
