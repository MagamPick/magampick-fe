import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import {
  REFUND_STATUS_BADGE,
  REFUND_STATUS_LABEL,
  daysLeftToAutoApprove,
} from '../lib/refundStatus'
import type { RefundRequest, RefundRequestItem } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 상품 요약 — 단일은 "이름 N개", 복수는 "첫 상품 외 N건" (OrderCard 와 동형) */
function summarizeItems(items: RefundRequestItem[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return `${items[0].name} ${items[0].quantity}개`
  return `${items[0].name} 외 ${items.length - 1}건`
}

interface Props {
  refund: RefundRequest
  /** 대기중(REQUESTED) 인라인 액션(승인/거부) — 처리완료면 미주입 */
  actions?: ReactNode
}

/**
 * 환불 요청 카드 (노션 「환불 승인/거부」) — 주문/고객/환불액/사유 + 상태 배지.
 * 대기중이면 자동 승인 기한(D-N) + 인라인 액션, 거부됨이면 거부 사유 표시.
 */
export function RefundRequestCard({ refund, actions }: Props) {
  const isPending = refund.status === 'REQUESTED'
  const daysLeft = daysLeftToAutoApprove(refund.requestedAt)

  return (
    <div className="rounded-[14px] border border-border bg-card p-[14px]">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[14px] font-extrabold text-foreground">#{refund.orderNo}</span>
        <span className="text-[12px] text-muted-foreground">{refund.customerName}님</span>
        <span
          className={cn(
            'ml-auto shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold',
            REFUND_STATUS_BADGE[refund.status],
          )}
        >
          {REFUND_STATUS_LABEL[refund.status]}
        </span>
      </div>

      <p className="text-[13.5px] font-bold text-foreground">{summarizeItems(refund.items)}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        환불 금액 <b className="font-bold text-foreground">{won(refund.amount)}</b>
      </p>

      {/* 소비자 환불 사유 */}
      <p className="mt-2.5 rounded-[10px] bg-background px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground">
        “{refund.reason}”
      </p>

      {isPending && (
        <p className="mt-2 text-[12px] font-semibold text-[#b07a00]">
          {daysLeft > 0
            ? `${daysLeft}일 내 미처리 시 자동 승인돼요`
            : '오늘 안에 처리하지 않으면 자동 승인돼요'}
        </p>
      )}
      {refund.status === 'REJECTED' && refund.rejectReason && (
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          거부 사유: {refund.rejectReason}
        </p>
      )}

      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  )
}
