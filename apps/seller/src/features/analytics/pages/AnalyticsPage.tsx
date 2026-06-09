import { useState } from 'react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { StoreSwitcher } from '@/features/store/components/StoreSwitcher'
import { useStores } from '@/features/store/hooks/useStores'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useAnalytics } from '../hooks/useAnalytics'
import { PeriodToggle } from '../components/PeriodToggle'
import { PanelTabs } from '../components/PanelTabs'
import { SalesPanel } from '../components/SalesPanel'
import { OrdersPanel } from '../components/OrdersPanel'
import { ClearancePanel } from '../components/ClearancePanel'
import { ReviewPanel } from '../components/ReviewPanel'
import type { AnalyticsPanel, AnalyticsPeriod } from '../types'

/**
 * 사장 통계 대시보드 (노션 「사장 통계 대시보드」, Phase 10) — 통계 탭.
 * 현재 선택 매장의 매출·주문·떨이·리뷰 지표를 기간(오늘·주·달·올해)별로 본다.
 * 매장 전환(헤더 칩)으로 매장별 통계를 본다. 기간 변경은 재조회, 패널 전환은 즉시.
 */
export function AnalyticsPage() {
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  // 다른 피처 훅(mock, string storeId)에 전달용 변환 — Step 2 실연동 시 hook 시그니처도 number로 이전
  const storeId = selectedStoreId != null ? String(selectedStoreId) : ''
  const { data: stores } = useStores()
  const storeName = stores?.find((s) => s.id === selectedStoreId)?.name

  const [period, setPeriod] = useState<AnalyticsPeriod>('today')
  const [panel, setPanel] = useState<AnalyticsPanel>('sales')
  const { data, isPending } = useAnalytics(storeId, period)

  return (
    <ScreenContainer variant="tab">
      <header className="sticky top-0 z-10 flex h-[52px] items-center justify-between gap-2 border-b border-border bg-card px-5">
        <h1 className="text-[16px] font-bold">통계</h1>
        <StoreSwitcher variant="chip" />
      </header>

      {storeName && (
        <p className="mx-5 mt-3 break-keep rounded-[10px] bg-secondary px-[14px] py-[10px] text-[12.5px] font-semibold leading-snug text-secondary-foreground">
          이 통계는 <b className="font-extrabold">{storeName}</b>의 데이터입니다.
        </p>
      )}

      <PeriodToggle value={period} onChange={setPeriod} />
      <PanelTabs value={panel} onChange={setPanel} />

      <div className="pb-6 pt-1">
        {isPending || !data ? (
          <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
        ) : panel === 'sales' ? (
          <SalesPanel sales={data.sales} period={period} />
        ) : panel === 'orders' ? (
          <OrdersPanel orders={data.orders} />
        ) : panel === 'clearance' ? (
          <ClearancePanel clearance={data.clearance} />
        ) : (
          <ReviewPanel review={data.review} />
        )}
      </div>
    </ScreenContainer>
  )
}
