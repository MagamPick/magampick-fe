import { ChevronRight, Store, Utensils, MessageSquare } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useReviewSummary } from '@/features/reviews/hooks/useReviewSummary'

const ICON_CLASS = 'size-[18px] text-muted-foreground'

/** 매장 운영 바로가기 (정적 진입점 — 대상 화면은 각 별도 기능. 리뷰 값만 요약 연동) */
export function HomeShortcuts() {
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const storeId = selectedStoreId != null ? String(selectedStoreId) : ''
  const { data: summary } = useReviewSummary(storeId)
  const reviewValue = `★ ${(summary?.average ?? 0).toFixed(1)} · ${summary?.total ?? 0}`

  const rows: { icon: ReactNode; label: string; value: string; to?: string }[] = [
    { icon: <Store className={ICON_CLASS} aria-hidden />, label: '매장 정보 · 영업시간', value: '영업시간 설정', to: ROUTES.STORE_MANAGE },
    { icon: <Utensils className={ICON_CLASS} aria-hidden />, label: '메뉴 관리', value: '', to: ROUTES.PRODUCTS },
    { icon: <MessageSquare className={ICON_CLASS} aria-hidden />, label: '리뷰 관리', value: reviewValue, to: ROUTES.REVIEWS },
  ]

  return (
    <div className="mx-5 mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-e2">
      {rows.map((row, i) => {
        const className = `flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`
        const inner = (
          <>
            <span className="flex size-[18px] shrink-0 items-center justify-center">{row.icon}</span>
            <span className="flex-1 text-[14px] font-semibold text-foreground">{row.label}</span>
            <span className="text-[12.5px] text-muted-foreground">{row.value}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </>
        )
        return row.to ? (
          <Link key={row.label} to={row.to} className={`${className} transition active:bg-muted`}>
            {inner}
          </Link>
        ) : (
          <div key={row.label} className={className}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}
