import { cn } from '@/shared/lib/utils'
import { INQUIRY_STATUS_LABEL } from '../lib/inquiryFormat'
import type { InquiryStatus } from '../types'

/** 상태 배지 — pending=warning(처리 필요) / answered=success(완료) */
const STATUS_CLASS: Record<InquiryStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  answered: 'bg-success/10 text-success',
}

export function InquiryStatusBadge({
  status,
  className,
}: {
  status: InquiryStatus
  className?: string
}) {
  return (
    <span
      data-status={status}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
        STATUS_CLASS[status],
        className,
      )}
    >
      {INQUIRY_STATUS_LABEL[status]}
    </span>
  )
}
