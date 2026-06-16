import { useQuery } from '@tanstack/react-query'
import { couponApi } from '../api/couponApi'
import { couponKeys } from './couponKeys'

/** 보유 쿠폰 조회 (쿠폰함, 결제 쿠폰 선택) — 만료분은 expired 로 보정됨 */
export function useCoupons() {
  return useQuery({
    queryKey: couponKeys.list(),
    queryFn: () => couponApi.listCoupons(),
    staleTime: 0,
  })
}
