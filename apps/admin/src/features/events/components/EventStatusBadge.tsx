import { cn } from '@/shared/lib/utils'
import { EVENT_STATUS_LABEL } from '../lib/eventFormat'
import type { EventStatus } from '../types'

/** 상태별 배지 색 — scheduled=info(대기), ongoing=success(진행), ended=muted(종료) */
const STATUS_STYLE: Record<EventStatus, string> = {
  scheduled: 'bg-info/10 text-info',
  ongoing: 'bg-success/10 text-success',
  ended: 'bg-muted text-muted-foreground',
}

export function EventStatusBadge({
  status,
  className,
}: {
  status: EventStatus
  className?: string
}) {
  return (
    <span
      data-status={status}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
        STATUS_STYLE[status],
        className,
      )}
    >
      {EVENT_STATUS_LABEL[status]}
    </span>
  )
}
