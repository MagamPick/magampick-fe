import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ApiError } from '@/shared/lib/apiError'
import { EventForm } from './EventForm'
import { useCreateEvent } from '../hooks/useCreateEvent'
import { useUpdateEvent } from '../hooks/useUpdateEvent'
import { todayYMD } from '../lib/eventFormat'
import type { EventFormValues } from '../lib/eventFormSchema'
import type { EventMutationPayload, EventView } from '../types'

const EMPTY_DEFAULTS: EventFormValues = {
  label: '',
  discountType: 'RATE',
  value: '',
  minOrder: '0',
  unlimited: false,
  issueLimit: '',
  validUntil: '',
  displayStartAt: '',
  displayEndAt: '',
}

/** EventView → 폼 입력값 프리필 (issueLimit null=무제한) */
function toFormValues(e: EventView): EventFormValues {
  return {
    label: e.label,
    discountType: e.discountType,
    value: String(e.value),
    minOrder: String(e.minOrder),
    unlimited: e.issueLimit === null,
    issueLimit: e.issueLimit === null ? '' : String(e.issueLimit),
    validUntil: e.validUntil,
    displayStartAt: e.displayStartAt,
    displayEndAt: e.displayEndAt,
  }
}

function errorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  return '저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
}

/**
 * 이벤트 생성/수정 모달. event=null 이면 생성, 있으면 수정(프리필 + value→discountValue 매핑은 api).
 * 성공 시 닫고 목록 무효화(훅 onSuccess).
 */
export function EventFormDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventView | null
}) {
  const create = useCreateEvent()
  const update = useUpdateEvent(event?.id ?? 0)
  const mode = event ? 'edit' : 'create'

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      create.reset()
      update.reset()
    }
    onOpenChange(next)
  }

  const handleSubmit = (payload: EventMutationPayload) => {
    const onSuccess = () => onOpenChange(false)
    if (event) update.mutate(payload, { onSuccess })
    else create.mutate(payload, { onSuccess })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '이벤트 수정' : '새 이벤트'}</DialogTitle>
          <DialogDescription>
            발급할 쿠폰과 노출 기간·수량을 정의합니다. 발급된 쿠폰엔 소급 적용되지 않습니다.
          </DialogDescription>
        </DialogHeader>
        <EventForm
          key={event?.id ?? 'create'}
          mode={mode}
          today={todayYMD()}
          defaultValues={event ? toFormValues(event) : EMPTY_DEFAULTS}
          issuedCount={event?.issuedCount ?? 0}
          isPending={create.isPending || update.isPending}
          serverError={errorMessage(event ? update.error : create.error)}
          submitLabel={mode === 'edit' ? '수정 저장' : '이벤트 생성'}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
