import { Bell, User } from 'lucide-react'
import { Link } from 'react-router'
import { StoreSwitcher } from '@/features/store/components/StoreSwitcher'
import { ROUTES } from '@/shared/lib/routes'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useReviewSummary } from '@/features/reviews/hooks/useReviewSummary'

/**
 * 사장 홈 히어로 — 오렌지 그라디언트 헤더 (프로토타입 .ms-hero).
 * 매장 선택기 + 알림센터 진입(미읽음 뱃지) + 현재 매장 평점·리뷰수(리뷰 요약).
 * 프로필 아이콘 → 마이 허브 (로그아웃·내 정보 수정·설정 등은 거기 메뉴 행).
 */
export function HomeHero() {
  const { data: unreadCount = 0 } = useUnreadCount()
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const storeId = selectedStoreId != null ? String(selectedStoreId) : ''
  const { data: summary } = useReviewSummary(storeId)

  return (
    <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary to-secondary-foreground px-5 pb-7 pt-[calc(env(safe-area-inset-top,0px)+1.75rem)] text-white shadow-e3">
      <div className="relative flex items-center gap-3">
        <img src="/icons/icon-192.png" alt="" aria-hidden className="size-14 rounded-2xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <StoreSwitcher />
          <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/95">
            <span className="text-warning">★</span>
            <span>{(summary?.average ?? 0).toFixed(1)}</span>
            <span className="opacity-55">·</span>
            <span>{summary?.total ?? 0} 리뷰</span>
          </div>
        </div>
        <Link
          to={ROUTES.NOTIFICATIONS}
          aria-label="알림"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span
              className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-warning px-1 text-[10px] font-extrabold leading-none text-foreground ring-2 ring-primary"
              aria-hidden
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <Link
          to={ROUTES.MYPAGE}
          aria-label="마이"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20"
        >
          <User className="size-5" />
        </Link>
      </div>
    </header>
  )
}
