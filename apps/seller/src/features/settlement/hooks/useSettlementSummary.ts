import { useQuery } from '@tanstack/react-query'
import { settlementApi } from '../api/settlementApi'
import { settlementKeys } from './settlementKeys'

/** 이번 회차 정산 요약 (마이 허브 카드 + 정산 내역 히어로) */
export function useSettlementSummary(storeId: string) {
  return useQuery({
    queryKey: settlementKeys.summary(storeId),
    queryFn: () => settlementApi.getSettlementSummary(storeId),
    enabled: !!storeId,
  })
}
