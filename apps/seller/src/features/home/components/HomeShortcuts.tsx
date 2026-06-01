import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'

/** 매장 운영 바로가기 (정적 진입점 — 대상 화면은 각 별도 기능) */
const ROWS: { icon: string; label: string; value: string; to?: string }[] = [
  { icon: '🏪', label: '매장 정보 · 영업시간', value: '영업시간 설정', to: ROUTES.STORE_MANAGE },
  { icon: '🍽️', label: '메뉴 관리', value: '', to: ROUTES.PRODUCTS },
  { icon: '💬', label: '리뷰 관리', value: '★ 4.8 · 412' },
]

export function HomeShortcuts() {
  return (
    <div className="mx-5 mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-e2">
      {ROWS.map((row, i) => {
        const className = `flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`
        const inner = (
          <>
            <span className="text-lg">{row.icon}</span>
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
