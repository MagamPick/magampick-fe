import { cn } from '@/shared/lib/utils'
import { summarizeWeek } from '../lib/businessHours'
import type { BusinessHour } from '../types'

interface Props {
  hours: BusinessHour[]
}

/** 읽기전용 주간 영업시간 요약 (매장 관리 카드) — 월~일 7행. */
export function BusinessHoursSummary({ hours }: Props) {
  const rows = summarizeWeek(hours)
  return (
    <div className="mx-5 mt-3 rounded-[16px] border border-border bg-card px-[18px] py-4">
      <div className="mb-2.5 text-[13px] font-bold text-muted-foreground">영업시간</div>
      {rows.map((r) => (
        <div key={r.day} className="flex gap-3 py-1.5 text-[14px]">
          <span className="w-16 shrink-0 font-semibold text-muted-foreground">{r.label}</span>
          <span className={cn('font-semibold', r.closed ? 'text-placeholder' : 'text-foreground')}>
            {r.text}
          </span>
        </div>
      ))}
    </div>
  )
}
