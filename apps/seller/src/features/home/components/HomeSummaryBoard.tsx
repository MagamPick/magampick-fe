import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics'
import {
  formatWonSymbol,
  formatUnit,
  formatPercent,
  pickupRate,
} from '@/features/analytics/lib/analyticsFormat'

/** 오늘 매출 보드 — 현재 매장의 오늘 통계 (analytics period=today). 미로딩 시 '—'. */
export function HomeSummaryBoard() {
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const storeId = selectedStoreId != null ? String(selectedStoreId) : ''
  const { data } = useAnalytics(storeId, 'today')

  const cols = [
    {
      label: '오늘 매출',
      value: data ? formatWonSymbol(data.sales.totalSales) : '—',
      accent: true,
    },
    { label: '오늘 주문', value: data ? formatUnit(data.orders.total, '건') : '—' },
    {
      label: '픽업 완료율',
      value: data ? formatPercent(pickupRate(data.orders.pickedUp, data.orders.total)) : '—',
    },
  ]

  return (
    <section className="mx-5 mt-6">
      <div className="flex items-stretch rounded-xl border border-border bg-card px-2 py-4 shadow-e1">
        {cols.map((col, i) => (
          <div
            key={col.label}
            className={`flex flex-1 flex-col items-center gap-1.5 ${i > 0 ? 'border-l border-border' : ''}`}
          >
            <span className="text-[11.5px] font-medium text-muted-foreground">{col.label}</span>
            <span className={`text-[17px] font-bold ${col.accent ? 'text-primary' : 'text-foreground'}`}>
              {col.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
