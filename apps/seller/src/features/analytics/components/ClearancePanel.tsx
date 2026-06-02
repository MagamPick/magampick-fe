import { StatRows } from './StatRows'
import { formatPercent, formatUnit, formatWon } from '../lib/analyticsFormat'
import type { ClearanceMetrics } from '../types'

/** 떨이 판매현황 패널 — 마감 할인 판매 수량 + 폐기 절감 수량·금액(강조) + 평균 할인율. */
export function ClearancePanel({ clearance }: { clearance: ClearanceMetrics }) {
  return (
    <div className="px-5 pt-5">
      <StatRows
        rows={[
          { key: '마감 할인 판매 수량', value: formatUnit(clearance.soldQty, '개') },
          { key: '폐기 절감 수량', value: formatUnit(clearance.savedQty, '개') },
          { key: '폐기 절감 금액', value: formatWon(clearance.savedAmount), accent: true },
          { key: '평균 할인율', value: formatPercent(clearance.avgDiscountRate) },
        ]}
      />
    </div>
  )
}
