import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  })
}
