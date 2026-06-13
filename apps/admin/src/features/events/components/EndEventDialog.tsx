import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/apiError'
import { useEndEvent } from '../hooks/useEndEvent'
import type { EventView } from '../types'

/**
 * 조기종료 confirm 모달. event !== null 이면 열림.
 * 종료 → POST /admin/coupons/{id}/end → 성공 시 닫고 목록 무효화(훅 onSuccess).
 */
export function EndEventDialog({
  event,
  onOpenChange,
}: {
  event: EventView | null
  onOpenChange: (open: boolean) => void
}) {
  const end = useEndEvent(event?.id ?? 0)

  const handleOpenChange = (next: boolean) => {
    if (!next) end.reset()
    onOpenChange(next)
  }

  const handleEnd = () => {
    end.mutate(undefined, { onSuccess: () => onOpenChange(false) })
  }

  const serverError =
    end.error instanceof ApiError
      ? end.error.message
      : end.error
        ? '종료 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  return (
    <Dialog open={event !== null} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>이벤트 조기종료</DialogTitle>
          <DialogDescription>
            <b className="font-semibold text-foreground">{event?.label}</b> 이벤트를 즉시 종료할까요?
            소비자 노출이 중단됩니다.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <p role="alert" className="px-5 text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={end.isPending}
          >
            취소
          </Button>
          <Button type="button" variant="destructive" onClick={handleEnd} disabled={end.isPending}>
            {end.isPending ? '종료 중…' : '조기종료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
