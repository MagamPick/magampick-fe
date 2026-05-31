import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'
import type { BusinessHour } from '../types'

/**
 * 영업시간 저장 — 성공 시 영업시간 캐시 직접 갱신(즉시 반영) + status 무효화.
 * status 의 todayCloseTime·canOpenToday 가 영업시간 파생이므로 함께 갱신해야 한다.
 * optimistic 아님 (명확한 성공/실패 피드백, state-convention §5 — useTransitionStatus 와 동일).
 */
export function useSaveBusinessHours(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hours: BusinessHour[]) => storeApi.saveBusinessHours({ storeId, hours }),
    onSuccess: (next: BusinessHour[]) => {
      queryClient.setQueryData(storeKeys.businessHours(storeId), next)
      queryClient.invalidateQueries({ queryKey: storeKeys.status(storeId) })
    },
  })
}
