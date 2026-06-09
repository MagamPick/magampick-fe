import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { useRefundRequests } from '../hooks/useRefundRequests'
import { useRefundActions } from '../hooks/useRefundActions'
import { RefundRequestCard } from '../components/RefundRequestCard'
import { RefundDecisionSheet } from '../components/RefundDecisionSheet'
import { statusToSegment } from '../lib/refundStatus'
import { REFUND_SEGMENTS } from '../types'
import type { RefundRequest, RefundSegment } from '../types'

const SEG_LABEL: Record<RefundSegment, string> = {
  pending: '대기중',
  resolved: '처리완료',
}
const SEG_EMPTY: Record<RefundSegment, string> = {
  pending: '대기 중인 환불 요청이 없어요.',
  resolved: '처리한 환불 내역이 없어요.',
}

const ghostBtn =
  'h-10 flex-1 rounded-xl bg-background text-[13.5px] font-bold text-foreground transition active:scale-[0.98] disabled:opacity-60'
const primaryBtn =
  'h-10 flex-1 rounded-xl bg-primary text-[13.5px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60'

/**
 * 환불 관리 (노션 「환불 승인/거부」) — 마이 허브에서 진입하는 풀스크린 inbox.
 * 대기중/처리완료 세그먼트 + 대기 건수 뱃지. 대기 카드의 승인/거부 → 결정 시트(전액 승인/사유 거부).
 * 자동 승인 기한(D-N)은 카드에 표시만(실제 자동승인 = BE 배치, 노션).
 */
export function RefundManagePage() {
  const navigate = useNavigate()
  // 환불은 아직 mock 피처(단일 매장 가정) — currentStore(number) 연동은 환불 실연동 단위에서.
  const storeId = 's1'
  const [searchParams, setSearchParams] = useSearchParams()

  const segParam = searchParams.get('seg')
  const seg: RefundSegment = (REFUND_SEGMENTS as readonly string[]).includes(segParam ?? '')
    ? (segParam as RefundSegment)
    : 'pending'
  const setSeg = (next: RefundSegment) =>
    setSearchParams(next === 'pending' ? {} : { seg: next }, { replace: true })

  const { data: refunds, isPending: listLoading, isError, refetch } = useRefundRequests(storeId)
  const actions = useRefundActions(storeId)
  const busy = actions.approve.isPending || actions.reject.isPending

  const [decision, setDecision] = useState<{
    target: RefundRequest
    mode: 'approve' | 'reject'
  } | null>(null)

  const all = refunds ?? []
  const countPending = all.filter((r) => r.status === 'REQUESTED').length
  const visible = all.filter((r) => statusToSegment(r.status) === seg)

  const handleApprove = () => {
    if (!decision) return
    actions.approve.mutate(decision.target.id, { onSuccess: () => setDecision(null) })
  }
  const handleReject = (reason: string) => {
    if (!decision) return
    actions.reject.mutate(
      { id: decision.target.id, reason },
      { onSuccess: () => setDecision(null) },
    )
  }

  return (
    <ScreenContainer variant="page" className="pb-10">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">환불 관리</h1>
      </header>

      <div role="tablist" aria-label="환불 상태" className="flex border-b border-border bg-card">
        {REFUND_SEGMENTS.map((value) => {
          const on = seg === value
          const count = value === 'pending' ? countPending : 0
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSeg(value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-[14px] transition',
                on
                  ? 'border-primary font-bold text-foreground'
                  : 'border-transparent font-semibold text-muted-foreground',
              )}
            >
              {SEG_LABEL[value]}
              {count > 0 && (
                <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-[9px] bg-primary px-1.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-4">
        {listLoading && <ListRowSkeleton className="py-2" media={false} />}

        {!listLoading && isError && (
          <ErrorState onRetry={() => refetch()}>환불 요청을 불러오지 못했어요.</ErrorState>
        )}

        {!listLoading && !isError && visible.length === 0 && (
          <EmptyState icon="💸">{SEG_EMPTY[seg]}</EmptyState>
        )}

        {visible.map((refund) => (
          <RefundRequestCard
            key={refund.id}
            refund={refund}
            actions={
              refund.status === 'REQUESTED' ? (
                <>
                  <button
                    type="button"
                    className={ghostBtn}
                    disabled={busy}
                    onClick={() => setDecision({ target: refund, mode: 'reject' })}
                  >
                    거부
                  </button>
                  <button
                    type="button"
                    className={primaryBtn}
                    disabled={busy}
                    onClick={() => setDecision({ target: refund, mode: 'approve' })}
                  >
                    승인
                  </button>
                </>
              ) : undefined
            }
          />
        ))}
      </div>

      <RefundDecisionSheet
        open={decision !== null}
        onOpenChange={(open) => {
          if (!open) setDecision(null)
        }}
        mode={decision?.mode ?? 'approve'}
        amount={decision?.target.amount ?? 0}
        onApprove={handleApprove}
        onReject={handleReject}
        isPending={busy}
      />
    </ScreenContainer>
  )
}
