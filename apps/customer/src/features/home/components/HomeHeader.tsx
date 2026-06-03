import { Bell, ChevronDown, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { useHomeAddress } from '../hooks/useHomeAddress'

/**
 * 홈 상단 헤더 — 기본 주소지(피드 기준점) + 알림/장바구니. 스크롤해도 상단 고정.
 * 주소지 칩 → 주소 설정(/addresses), 알림 → 알림센터(미읽음 수 뱃지), 장바구니 → /cart.
 */
export function HomeHeader() {
  const { data } = useHomeAddress()
  const { data: unreadCount = 0 } = useUnreadCount()
  const label = data?.label ?? '위치 불러오는 중…'

  return (
    <div className="sticky top-0 z-30 flex items-center gap-1.5 border-b border-border bg-card px-5 pb-3 pt-[calc(env(safe-area-inset-top,0px)+14px)]">
      <Link
        to={ROUTES.ADDRESSES}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-1 py-1.5 text-left"
      >
        <span aria-hidden className="text-[15px]">
          📍
        </span>
        <span className="truncate text-base font-extrabold tracking-[-0.3px]">{label}</span>
        <ChevronDown className="size-4 flex-shrink-0 text-muted-foreground" aria-hidden />
      </Link>
      <div className="flex flex-shrink-0">
        <Link
          to={ROUTES.NOTIFICATIONS}
          aria-label="알림"
          className="relative inline-flex size-11 items-center justify-center text-foreground"
        >
          <Bell className="size-[22px]" aria-hidden />
          {unreadCount > 0 && (
            <span
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white"
              aria-hidden
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <Link
          to={ROUTES.CART}
          aria-label="장바구니"
          className="inline-flex size-11 items-center justify-center text-foreground"
        >
          <ShoppingCart className="size-[22px]" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
