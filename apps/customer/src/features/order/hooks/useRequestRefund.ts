import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'

/**
 * 환불 요청 mutation — 픽업 완료 주문에 사유와 함께 요청(노션 「환불 요청」).
 * variable = 환불 사유(string). 성공 시 목록·상세 무효화(useCancelOrder 패턴).
 */
export function useRequestRefund(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) => orderApi.requestRefund(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.list() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
    },
  })
}
