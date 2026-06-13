import { NavLink, Outlet } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { useLogout } from '@/features/auth/hooks/useLogout'

/** 일반 운영 메뉴 (위험 동작 없음) */
const NAV_ITEMS = [
  { to: ROUTES.EVENTS, label: '이벤트' },
  { to: ROUTES.ANNOUNCEMENTS, label: '공지사항' },
  { to: ROUTES.INQUIRIES, label: '문의' },
] as const

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2.5 text-sm font-semibold transition',
    isActive
      ? 'bg-secondary text-secondary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

/**
 * 데스크톱 좌측 사이드바 셸 — 브랜드 + 운영 네비 + 운영 도구 + 로그아웃.
 * 자식 라우트가 우측 <Outlet/> 에 렌더된다 (ProtectedRoute 아래 pathless 부모 레이아웃).
 */
export function AdminShell() {
  const logout = useLogout()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6">
        <div className="px-2 pb-6">
          <span className="text-lg font-extrabold tracking-[-0.5px] text-foreground">
            마감픽 <span className="text-primary">관리자</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navClass}>
              {label}
            </NavLink>
          ))}

          {/* 운영 도구 — 위험 동작 포함이라 일반 메뉴와 구분선으로 분리 */}
          <div className="my-3 border-t border-border" />
          <NavLink to={ROUTES.OPS} className={navClass}>
            운영 도구
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="mt-4 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          로그아웃
        </button>
      </aside>

      <main className="flex-1 px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}
