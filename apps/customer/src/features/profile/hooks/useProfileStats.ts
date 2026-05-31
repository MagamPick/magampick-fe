import { useQuery } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { profileKeys } from './profileQueryKeys'

/** 마이페이지 통계(이번 달 절약·구한 음식·단골) — mock, 연동 시 orders/favorite 도메인에서 산출 */
export function useProfileStats() {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: () => profileApi.getStats(),
  })
}
