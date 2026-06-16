import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: () => orderApi.listOrders(),
    refetchInterval: 30_000,
    staleTime: 0,
  })
}
