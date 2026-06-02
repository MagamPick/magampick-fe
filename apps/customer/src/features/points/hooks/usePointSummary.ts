import { useQuery } from '@tanstack/react-query'
import { pointApi } from '../api/pointApi'
import { pointKeys } from './pointKeys'

/** 포인트 잔액 조회 (마이→포인트 hero, 결제 화면 한도) */
export function usePointSummary() {
  return useQuery({
    queryKey: pointKeys.summary(),
    queryFn: () => pointApi.getSummary(),
  })
}
