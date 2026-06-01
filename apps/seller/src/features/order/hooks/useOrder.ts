import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'

/** 주문 단건 조회 (사장 주문 상세). id 없으면 호출 안 함 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  })
}
