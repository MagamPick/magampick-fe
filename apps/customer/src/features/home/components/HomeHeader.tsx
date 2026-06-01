import { Bell, ChevronDown, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { useHomeAddress } from '../hooks/useHomeAddress'

/**
 * 홈 상단 헤더 — 기본 주소지(피드 기준점) + 알림/장바구니. 스크롤해도 상단 고정.
 * 주소지 칩 → 주소 설정(/addresses), 장바구니 → /cart. 알림은 미구현이라 탭 시 "준비 중" 안내.
 */
export function HomeHeader() {
  const { show } = useComingSoon()
  const { data } = useHomeAddress()
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
        <button
          type="button"
          aria-label="알림"
          onClick={() => show('알림은 준비 중이에요.')}
          className="inline-flex size-11 items-center justify-center text-foreground"
        >
          <Bell className="size-[22px]" aria-hidden />
        </button>
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
