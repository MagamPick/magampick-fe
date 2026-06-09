import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'
import type { OperationStatus, StoreStatus } from '../types'

/**
 * 영업 상태 전환 — 성공 시 해당 매장 status 캐시 직접 갱신(전환 즉시 반영).
 * optimistic 아님 (명확한 성공/실패 피드백, state-convention §5).
 * storeId null이면 mutate 호출 시 즉시 reject(UI 가드 역할).
 */
export function useTransitionStatus(storeId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (to: OperationStatus) => {
      if (storeId == null) return Promise.reject(new Error('매장이 선택되지 않았습니다'))
      return storeApi.transitionStatus({ storeId, to })
    },
    onSuccess: (next: StoreStatus) => {
      if (storeId == null) return
      queryClient.setQueryData(storeKeys.status(storeId), next)
    },
  })
}
