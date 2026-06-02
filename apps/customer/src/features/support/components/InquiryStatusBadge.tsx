import { cn } from '@/shared/lib/utils'
import { INQUIRY_STATUS_LABEL, type InquiryStatus } from '../types'

const STATUS_CLASS: Record<InquiryStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  answered: 'bg-success/10 text-success',
}

/** 문의 상태 배지 — 대기(중립) / 답변완료(성공) */
export function InquiryStatusBadge({
  status,
  className,
}: {
  status: InquiryStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold',
        STATUS_CLASS[status],
        className,
      )}
    >
      {INQUIRY_STATUS_LABEL[status]}
    </span>
  )
}
