import { cn } from '@/shared/lib/utils'
import { barHeights, peakIndex } from '../lib/analyticsFormat'
import type { SalesBar } from '../types'

/**
 * 기간별 매출 막대차트 (프로토타입 `.bar-chart`) — 최댓값을 100%로 정규화, 최고점은 주황 강조.
 * 라벨은 기간에 따라 시간대/요일/주차/월 (mock 이 라벨까지 제공).
 */
export function SalesBarChart({ bars }: { bars: SalesBar[] }) {
  const amounts = bars.map((b) => b.amount)
  const heights = barHeights(amounts)
  const peak = peakIndex(amounts)
  return (
    <div className="flex h-[158px] items-end gap-[7px] px-5 pt-4" aria-hidden>
      {bars.map((b, i) => (
        <div
          key={b.label}
          className="flex h-full flex-1 flex-col items-center justify-end gap-[7px]"
        >
          <div
            className={cn(
              'w-full max-w-[28px] rounded-t-[6px]',
              i === peak ? 'bg-primary' : 'bg-cream-deep',
            )}
            style={{ height: `${heights[i]}%`, minHeight: 4 }}
          />
          <span className="text-[11px] font-semibold text-muted-foreground">{b.label}</span>
        </div>
      ))}
    </div>
  )
}
