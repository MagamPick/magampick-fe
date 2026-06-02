import { MetricHero } from './MetricHero'
import { SalesBarChart } from './SalesBarChart'
import { StatRows } from './StatRows'
import { formatDelta, formatWon, formatWonSymbol, periodLabel } from '../lib/analyticsFormat'
import type { AnalyticsPeriod, SalesMetrics } from '../types'

/** 매출 패널 — 기간 매출(총매출) + 증감 + 막대차트 + 평균 객단가·최다 시간대. */
export function SalesPanel({ sales, period }: { sales: SalesMetrics; period: AnalyticsPeriod }) {
  return (
    <div>
      <MetricHero
        label={`${periodLabel(period)} 매출`}
        value={formatWonSymbol(sales.totalSales)}
        delta={formatDelta(sales.deltaPct)}
      />
      <SalesBarChart bars={sales.chart} />
      <div className="px-5 pt-5">
        <StatRows
          rows={[
            { key: '평균 객단가', value: formatWon(sales.avgOrderValue) },
            { key: '최다 주문 시간대', value: sales.peakHour },
          ]}
        />
      </div>
    </div>
  )
}
