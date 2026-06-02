import { cn } from '@/shared/lib/utils'
import { ANALYTICS_PANELS } from '../types'
import type { AnalyticsPanel } from '../types'

interface Props {
  value: AnalyticsPanel
  onChange: (panel: AnalyticsPanel) => void
}

/** 패널 세그먼트 탭 (in-app seg 패턴, ProductListPage 미러) — 매출·주문·떨이·리뷰. */
export function PanelTabs({ value, onChange }: Props) {
  return (
    <div className="flex border-b border-border bg-card" role="tablist" aria-label="통계 항목">
      {ANALYTICS_PANELS.map((p) => {
        const on = p.value === value
        return (
          <button
            key={p.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(p.value)}
            className={cn(
              'flex-1 border-b-2 py-3 text-[14px] transition',
              on
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent font-semibold text-muted-foreground',
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
