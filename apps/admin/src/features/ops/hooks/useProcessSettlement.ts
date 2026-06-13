import { useMutation } from '@tanstack/react-query'
import { opsApi } from '../api/opsApi'

/**
 * 정산 배치 수동 트리거. targetDate("yyyy-MM-dd") 미지정(undefined)=오늘.
 * 정산 내역 조회 화면이 없어 캐시 무효화 없음 — 결과(processedCount)는 mutation.data 로 표시.
 * confirm·에러 표시는 호출 측(SettlementCard) 담당.
 */
export function useProcessSettlement() {
  return useMutation({
    mutationFn: (targetDate: string | undefined) => opsApi.processSettlement(targetDate),
  })
}
