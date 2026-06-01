import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'

/** 매장 주문 목록 조회 (사장 주문 탭) — 현재 선택된 매장 기준 */
export function useOrders(storeId: string) {
  return useQuery({
    queryKey: orderKeys.list(storeId),
    queryFn: () => orderApi.listOrders(storeId),
  })
}
