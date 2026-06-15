import { useQuery } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { profileKeys } from './profileQueryKeys'

/** 마이페이지 통계(이번 달 절약·구한 음식·단골) — GET /customers/me/stats (BE 집계) */
export function useProfileStats() {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: () => profileApi.getStats(),
  })
}
