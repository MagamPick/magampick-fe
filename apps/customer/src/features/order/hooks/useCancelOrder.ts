import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'

export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.list() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
    },
  })
}
