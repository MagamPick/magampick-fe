import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApi } from '../api/eventApi'
import { eventKeys } from './eventKeys'
import type { EventUpdatePayload } from '../types'

/** 이벤트 수정 — 성공 시 목록 무효화. (value→discountValue 매핑은 eventApi 책임) */
export function useUpdateEvent(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EventUpdatePayload) => eventApi.updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
    },
  })
}
