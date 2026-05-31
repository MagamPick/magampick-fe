import { Bell } from 'lucide-react'
import { StoreSwitcher } from '@/features/store/components/StoreSwitcher'

/**
 * 사장 홈 히어로 — 오렌지 그라디언트 헤더 (프로토타입 .ms-hero).
 * 매장 선택기만 실동작. 평점·리뷰·알림은 정적/비활성 (별도 기능).
 */
export function HomeHero() {
  return (
    <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary to-secondary-foreground px-5 pb-7 pt-[calc(env(safe-area-inset-top,0px)+1.75rem)] text-white shadow-e3">
      <div className="relative flex items-center gap-3.5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[30px] ring-2 ring-inset ring-white/55">
          🥐
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <StoreSwitcher />
          <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/95">
            <span className="text-warning">★</span>
            <span>4.8</span>
            <span className="opacity-55">·</span>
            <span>412 리뷰</span>
          </div>
        </div>
        <button
          type="button"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20"
          aria-label="알림"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2 size-2 rounded-full bg-warning ring-2 ring-primary" aria-hidden />
        </button>
      </div>
    </header>
  )
}
