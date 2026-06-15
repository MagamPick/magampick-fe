import { useMutation, useQueryClient } from '@tanstack/react-query'
import { couponApi } from '../api/couponApi'
import { couponKeys } from './couponKeys'

/** 이벤트 쿠폰 받기 — 성공 시 쿠폰함·이벤트 목록 무효화(1인 1회 반영) */
export function useClaimEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (couponId: number) => couponApi.claim(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all })
    },
  })
}
