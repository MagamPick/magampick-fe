import { cn } from '@/shared/lib/utils'
import { POINT_REASON_LABEL, pointDirection, type PointTransaction } from '../types'

/** 포인트 내역 한 행 (프로토타입 `.pt-row`) — 부호 아이콘 + 사유·매장 + 일자 + 증감액 */
export function PointHistoryRow({ txn }: { txn: PointTransaction }) {
  const earn = pointDirection(txn.reason) === 'earn'
  return (
    <li className="flex min-h-[60px] items-center gap-3 border-b border-border px-1 py-3.5 last:border-b-0">
      <span
        className="flex size-[38px] shrink-0 items-center justify-center rounded-md bg-muted text-[18px] text-muted-foreground"
        aria-hidden
      >
        {earn ? '＋' : '−'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {`${POINT_REASON_LABEL[txn.reason]} · ${txn.storeName ?? '시스템'}`}
        </p>
        <p className="mt-[3px] text-xs text-muted-foreground">{txn.date}</p>
      </div>
      <span
        className={cn(
          'shrink-0 text-[15px] font-extrabold tabular-nums',
          earn ? 'text-primary' : 'text-foreground',
        )}
      >
        {`${earn ? '+' : '-'}${txn.amount.toLocaleString('ko-KR')}P`}
      </span>
    </li>
  )
}
