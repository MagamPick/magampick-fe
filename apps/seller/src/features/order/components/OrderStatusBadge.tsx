import { cn } from '@/shared/lib/utils'
import { ORDER_STATUS_LABEL, statusToSegment } from '../lib/orderStatus'
import type { OrderSegment, OrderStatus } from '../types'

/**
 * 주문 상태 배지 — 라벨은 상태별(매장 거절/고객 취소/미수령 구분), 색은 세그먼트별.
 * 색은 프로토타입 status-badge 토큰 매핑(준비중 amber 텍스트는 토큰 부재로 #b07a00).
 */
const SEGMENT_BADGE_CLASS: Record<OrderSegment, string> = {
  new: 'bg-destructive/10 text-destructive',
  prep: 'bg-warning/10 text-warning-foreground',
  ready: 'bg-info/10 text-info',
  done: 'bg-success/10 text-success',
  cancel: 'bg-muted text-muted-foreground',
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold',
        SEGMENT_BADGE_CLASS[statusToSegment(status)],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
