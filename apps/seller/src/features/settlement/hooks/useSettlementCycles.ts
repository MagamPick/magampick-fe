import { useQuery } from '@tanstack/react-query'
import { settlementApi } from '../api/settlementApi'
import { settlementKeys } from './settlementKeys'

/** 매장 정산 회차 목록 (노션 「정산 내역 조회」 — 회차별 내역) */
export function useSettlementCycles(storeId: string) {
  return useQuery({
    queryKey: settlementKeys.list(storeId),
    queryFn: () => settlementApi.listSettlementCycles(storeId),
    enabled: !!storeId,
  })
}
