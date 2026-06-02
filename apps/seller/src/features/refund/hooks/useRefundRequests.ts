import { useQuery } from '@tanstack/react-query'
import { refundApi } from '../api/refundApi'
import { refundKeys } from './refundKeys'

/** 매장 환불 요청 목록 (노션 「환불 승인/거부」 — 요청 목록 진입점) */
export function useRefundRequests(storeId: string) {
  return useQuery({
    queryKey: refundKeys.list(storeId),
    queryFn: () => refundApi.listRefundRequests(storeId),
  })
}
