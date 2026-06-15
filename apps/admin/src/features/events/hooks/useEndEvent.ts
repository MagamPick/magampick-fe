import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApi } from '../api/eventApi'
import { eventKeys } from './eventKeys'

/** 이벤트 조기종료 — 성공 시(active=false, status=ended) 목록 무효화. */
export function useEndEvent(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => eventApi.endEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
    },
  })
}
