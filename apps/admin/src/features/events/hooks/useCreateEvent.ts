import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApi } from '../api/eventApi'
import { eventKeys } from './eventKeys'
import type { EventCreatePayload } from '../types'

/** 이벤트 생성 — 성공 시 목록 무효화. 모달 닫기/에러 표시는 호출 측 담당. */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EventCreatePayload) => eventApi.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
    },
  })
}
