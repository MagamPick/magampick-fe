import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { SegTabs, type SegTabItem } from '@/shared/components/SegTabs'
import { EmptyState } from '@/shared/components/EmptyState'
import { usePointSummary } from '../hooks/usePointSummary'
import { usePointHistory } from '../hooks/usePointHistory'
import type { PointHistoryFilter } from '../types'
import { PointHero } from '../components/PointHero'
import { PointHistoryRow } from '../components/PointHistoryRow'

const TABS: SegTabItem<PointHistoryFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'earn', label: '적립' },
  { value: 'use', label: '사용' },
]

/**
 * 포인트 내역 (노션 「포인트 내역 조회」, 프로토타입 55-point-history).
 * 잔액 Hero + 전체/적립/사용 탭 + 최신순 내역. 마이 → 포인트 진입.
 */
export function PointHistoryPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<PointHistoryFilter>('all')
  const { data: summary } = usePointSummary()
  const { data: history, isLoading } = usePointHistory(filter)

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">포인트</h1>
      </header>

      <main className="flex-1 pb-6">
        <PointHero balance={summary?.balance ?? 0} />
        <div className="mt-4">
          <SegTabs ariaLabel="포인트 내역 필터" tabs={TABS} value={filter} onChange={setFilter} />
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">불러오는 중…</p>
        ) : history && history.length > 0 ? (
          <ul className="px-5 pb-6 pt-1">
            {history.map((txn) => (
              <PointHistoryRow key={txn.id} txn={txn} />
            ))}
          </ul>
        ) : (
          <EmptyState icon="🪙">해당 내역이 없어요.</EmptyState>
        )}
      </main>
    </ScreenContainer>
  )
}
