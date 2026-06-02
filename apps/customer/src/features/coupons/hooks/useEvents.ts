import { useQuery } from '@tanstack/react-query'
import { couponApi } from '../api/couponApi'
import { couponKeys } from './couponKeys'

/** 받을 수 있는 이벤트 쿠폰 조회 (마이→이벤트) — 받음 여부 포함 */
export function useEvents() {
  return useQuery({
    queryKey: couponKeys.events(),
    queryFn: () => couponApi.listEvents(),
  })
}
