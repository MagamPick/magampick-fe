import { cn } from '@/shared/lib/utils'
import { ANALYTICS_PERIODS } from '../types'
import type { AnalyticsPeriod } from '../types'

interface Props {
  value: AnalyticsPeriod
  onChange: (period: AnalyticsPeriod) => void
}

/** 기간 토글 (프로토타입 `.period-row`) — 오늘·이번 주·이번 달·올해. 선택 시 주황 채움. */
export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 px-5 pb-0.5 pt-3.5" role="group" aria-label="기간 선택">
      {ANALYTICS_PERIODS.map((p) => {
        const on = p.value === value
        return (
          <button
            key={p.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(p.value)}
            className={cn(
              'min-h-[44px] flex-1 rounded-[10px] border text-[13px] transition',
              on
                ? 'border-primary bg-primary font-bold text-primary-foreground'
                : 'border-border bg-card font-semibold text-muted-foreground',
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
