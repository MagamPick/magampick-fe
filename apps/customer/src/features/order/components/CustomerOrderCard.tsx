import { cn } from '@/shared/lib/utils'
import type { Order, OrderStatus, RefundStatus } from '../types'
import { PICKUP_WAITING_STATUSES, DONE_STATUSES } from '../types'
import { REFUND_STATUS_LABEL } from '../lib/refundPolicy'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '결제 완료',
  PREPARING: '픽업 대기',
  READY: '준비 완료',
  COMPLETED: '픽업 완료',
  NO_SHOW: '미수령',
  REJECTED: '주문 거절',
  CANCELLED: '주문 취소',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-primary/10 text-primary',
  PREPARING: 'bg-info/10 text-info',
  READY: 'bg-warning/10 text-warning',
  COMPLETED: 'bg-success/10 text-success',
  NO_SHOW: 'bg-muted text-muted-foreground',
  REJECTED: 'bg-destructive/10 text-destructive',
  CANCELLED: 'bg-muted text-muted-foreground',
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

interface Props {
  order: Order
  onClick: () => void
  onReviewClick?: () => void
}

const DONE_DATE_LABEL: Partial<Record<OrderStatus, string>> = {
  COMPLETED: '픽업 완료',
  CANCELLED: '주문 취소',
  REJECTED: '주문 거절',
  NO_SHOW: '미수령',
}

/** 환불 상태 칩 색 — 완료 카드에서 환불 진행 표시 */
const REFUND_CHIP: Record<RefundStatus, string> = {
  REQUESTED: 'bg-primary/10 text-primary',
  APPROVED: 'bg-success/10 text-success',
  REJECTED: 'bg-destructive/10 text-destructive',
}

export function CustomerOrderCard({ order, onClick, onReviewClick }: Props) {
  const isWaiting = PICKUP_WAITING_STATUSES.includes(order.status)
  const isCompleted = order.status === 'COMPLETED'
  const isDone = DONE_STATUSES.includes(order.status)

  const firstItem = order.items[0]
  const extraCount = order.items.length - 1
  const itemLabel = extraCount > 0 ? `${firstItem.name} 외 ${extraCount}건` : firstItem.name

  const pickupLabel = order.pickup.type === 'asap' ? '가능한 빨리' : `오늘 ${order.pickup.time}`
  const doneLabel = DONE_DATE_LABEL[order.status]
  const doneDate = order.completedAt ?? order.createdAt

  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-card">
      {/* 카드 메인 — 탭 시 상세 이동 */}
      <button
        type="button"
        onClick={onClick}
        className="w-full p-4 text-left transition active:bg-muted"
      >
        {/* 상단: 매장명 + 상태배지 */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-foreground">{order.storeName}</span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
              STATUS_COLOR[order.status],
            )}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>

        {/* 중단: 상품 요약 */}
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">{itemLabel}</p>

        {/* 하단: 금액 + 상태별 우측 정보 */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground">
            {/* 실청구액(finalAmount) — 혜택 미적용/구주문은 payTotal 폴백(A4-2) */}
            {won(order.amounts.finalAmount ?? order.amounts.payTotal)}
          </span>
          {isWaiting && (
            <span className="flex flex-col items-end gap-0.5 text-[12px] text-muted-foreground">
              <span>{pickupLabel} 픽업</span>
              <span className="flex items-center gap-1">
                픽업코드
                <span className="font-mono text-[13px] font-bold tracking-widest text-primary">
                  {order.pickupCode}
                </span>
              </span>
            </span>
          )}
          {/* COMPLETED 는 아래 리뷰 행에서 날짜 표시 — 여기선 나머지 DONE 상태만 */}
          {isDone && !isCompleted && doneLabel && (
            <span className="text-[12px] text-muted-foreground">
              {formatDate(doneDate)} {doneLabel}
            </span>
          )}
        </div>
      </button>

      {/* 리뷰 쓰기 — 완료 주문, 날짜 행과 같은 높이로 인라인 (button 중첩 방지) */}
      {isCompleted && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            {formatDate(doneDate)} {doneLabel}
            {order.refund && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-bold',
                  REFUND_CHIP[order.refund.status],
                )}
              >
                {REFUND_STATUS_LABEL[order.refund.status]}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={onReviewClick}
            className="rounded-full border border-primary px-3 py-1 text-[12px] font-bold text-primary transition active:bg-primary/10"
          >
            리뷰 쓰기
          </button>
        </div>
      )}
    </div>
  )
}
