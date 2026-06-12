import { useState } from 'react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { BizStatusCard } from '@/features/store/components/BizStatusCard'
import { BizStatusSheet } from '@/features/store/components/BizStatusSheet'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { HomeHero } from '../components/HomeHero'
import { HomeShortcuts } from '../components/HomeShortcuts'
import { HomeSummaryBoard } from '../components/HomeSummaryBoard'
import { HomeTaskCard } from '../components/HomeTaskCard'
import { HomeQuickActions } from '../components/HomeQuickActions'
import { HomeDealList } from '../components/HomeDealList'

/**
 * 사장 홈 (대시보드) — 실시간 활동 중심.
 * 요약 보드(오늘 통계)·처리 필요(상태별 주문)·진행중 마감할인·평점/리뷰수는 실 BE 연동
 * (analytics·order·clearance·review 훅). 영업 상태 카드 + [관리] 시트로 영업 상태 관리.
 * 정적 카탈로그(메뉴 전체)는 홈에 두지 않고 상품 탭(별도 기능)으로 — 바로가기로 진입.
 */
export function SellerHomePage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const { data: status, isLoading } = useStoreStatus(selectedStoreId)

  return (
    <ScreenContainer variant="tab">
      <HomeHero />
      <BizStatusCard status={status} isLoading={isLoading} onManage={() => setSheetOpen(true)} />
      <HomeShortcuts />
      <HomeSummaryBoard />
      <HomeTaskCard />
      <HomeQuickActions />
      <HomeDealList />

      {status && selectedStoreId != null && (
        <BizStatusSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          storeId={selectedStoreId}
          status={status}
        />
      )}
    </ScreenContainer>
  )
}
