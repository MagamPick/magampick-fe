import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useSettlementCycles } from '../hooks/useSettlementCycles'
import { SettlementSummaryCard } from '../components/SettlementSummaryCard'
import { SettlementCycleRow } from '../components/SettlementCycleRow'
import { FeeGuideCard } from '../components/FeeGuideCard'

/**
 * 정산 내역 (노션 「정산 내역 조회」) — 마이 허브에서 진입하는 풀스크린.
 * 이번 회차 정산 예정(히어로) + 회차별 내역 + 수수료 안내. 현재 선택 매장 기준(다매장 전환 = Phase 2).
 * 정산 산출·송금(시스템 배치)은 「정산 처리」 — 여기선 그 결과를 조회만 한다.
 */
export function SettlementHistoryPage() {
  const navigate = useNavigate()
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const { data: cycles, isPending, isError, refetch } = useSettlementCycles(storeId)
  const list = cycles ?? []

  return (
    <ScreenContainer variant="page" className="pb-8">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">정산 내역</h1>
      </header>

      <SettlementSummaryCard className="mx-5 mt-4" />

      <section className="mx-5 mt-3 rounded-[16px] border border-border bg-card px-[18px] py-4">
        <h2 className="mb-1.5 text-[13px] font-bold text-muted-foreground">정산 내역</h2>
        {isPending ? (
          <ListRowSkeleton className="py-2" media={false} />
        ) : isError ? (
          <ErrorState className="py-8" onRetry={() => refetch()}>
            정산 내역을 불러오지 못했어요.
          </ErrorState>
        ) : list.length === 0 ? (
          <EmptyState className="py-8" icon="💰">
            정산 내역이 없어요.
          </EmptyState>
        ) : (
          <div>
            {list.map((cycle) => (
              <SettlementCycleRow key={cycle.id} cycle={cycle} />
            ))}
          </div>
        )}
      </section>

      <FeeGuideCard className="mx-5 mt-3" />
    </ScreenContainer>
  )
}
