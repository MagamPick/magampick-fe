import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'
import type { BusinessHour } from '../types'

/**
 * 영업시간 저장 — 성공 시 영업시간 캐시 직접 갱신(즉시 반영) + status 무효화.
 * status 의 todayCloseTime·canOpenToday 가 영업시간 파생이므로 함께 갱신해야 한다.
 * optimistic 아님 (명확한 성공/실패 피드백, state-convention §5 — useTransitionStatus 와 동일).
 * storeId null이면 mutate 호출 시 즉시 reject(UI 가드 역할).
 */
export function useSaveBusinessHours(storeId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hours: BusinessHour[]) => {
      if (storeId == null) return Promise.reject(new Error('매장이 선택되지 않았습니다'))
      return storeApi.saveBusinessHours({ storeId, hours })
    },
    onSuccess: (next: BusinessHour[]) => {
      if (storeId == null) return
      queryClient.setQueryData(storeKeys.businessHours(storeId), next)
      queryClient.invalidateQueries({ queryKey: storeKeys.status(storeId) })
    },
  })
}
