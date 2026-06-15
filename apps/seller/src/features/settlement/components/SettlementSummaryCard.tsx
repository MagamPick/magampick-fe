import { cn } from '@/shared/lib/utils'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { formatMonthDay } from '../lib/settlementCalc'
import { useSettlementSummary } from '../hooks/useSettlementSummary'

const CARD =
  'rounded-[16px] bg-[linear-gradient(150deg,#FF8A5C,#FF6B35)] p-[18px] text-white shadow-e2'

interface Props {
  className?: string
}

/**
 * 이번 회차 정산 예정 카드 (프로토타입 `.settle-card`) — 마이 허브·정산 내역 화면 공용.
 * useSettlementSummary 로 이번 회차 정산 예정 금액 + 입금 예정일 표시. 현재 선택 매장 기준.
 */
export function SettlementSummaryCard({ className }: Props) {
  const _storeIdNum = useCurrentStoreStore((s) => s.selectedStoreId)
  // mock hook(string storeId) 전달용 변환 — Step 2 실연동 시 이전
  const storeId = _storeIdNum != null ? String(_storeIdNum) : ''
  const { data: summary, isPending } = useSettlementSummary(storeId)

  if (isPending) {
    return (
      <div className={cn(CARD, className)} aria-hidden>
        <div className="h-[15px] w-32 animate-pulse rounded bg-white/30" />
        <div className="mt-2 h-[26px] w-40 animate-pulse rounded bg-white/30" />
        <div className="mt-2 h-[13px] w-28 animate-pulse rounded bg-white/30" />
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className={cn(CARD, className)}>
      <p className="text-[12.5px] font-semibold text-white/90">이번 회차 정산 예정 금액</p>
      <p className="mt-[7px] text-[25px] font-extrabold tracking-[-0.5px]">
        ₩{summary.netAmount.toLocaleString('ko-KR')}
      </p>
      <p className="mt-[7px] text-[12px] text-white/90">
        입금 예정일 · {formatMonthDay(new Date(summary.depositDate))}
      </p>
    </div>
  )
}
