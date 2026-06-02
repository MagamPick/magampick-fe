import { cn } from '@/shared/lib/utils'
import { formatMonthDay, formatPeriod } from '../lib/settlementCalc'
import {
  SETTLEMENT_STATUS_BADGE,
  SETTLEMENT_STATUS_LABEL,
  depositLabelPrefix,
} from '../lib/settlementStatus'
import type { SettlementCycle } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

interface Props {
  cycle: SettlementCycle
}

/** 정산 회차 1행 (프로토타입 42-settlement `.settle-row`) — 기간·입금일 / 정산액·상태 배지 */
export function SettlementCycleRow({ cycle }: Props) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-[13px] last:border-b-0">
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-[14px] font-bold text-foreground">
          {formatPeriod(cycle.year, cycle.month, cycle.half)}
        </span>
        <span className="text-[12px] text-muted-foreground">
          {depositLabelPrefix(cycle.status)} · {formatMonthDay(new Date(cycle.depositDate))}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-[5px]">
        <span className="text-[14px] font-extrabold text-foreground">{won(cycle.netAmount)}</span>
        <span
          className={cn(
            'rounded-xl px-2.5 py-1 text-[11px] font-bold',
            SETTLEMENT_STATUS_BADGE[cycle.status],
          )}
        >
          {SETTLEMENT_STATUS_LABEL[cycle.status]}
        </span>
      </span>
    </div>
  )
}
