import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/shared/lib/routes'

/**
 * 마이 탭 — 전체 마이페이지(프로필·통계·메뉴 그룹)는 별도 기능 PR 에서 구현.
 * 지금은 주소지 진입점만 연결한다 ("주소 설정" → /addresses).
 * 행 스타일은 프로토타입 25-mypage "설정 · 지원" 메뉴 행을 따른다.
 */
export function MyTab() {
  return (
    <section className="flex flex-1 flex-col pt-[env(safe-area-inset-top,0px)]">
      <h1 className="sr-only">마이</h1>
      <div className="mx-5 mt-4 overflow-hidden rounded-xl border border-border bg-card">
        <Link
          to={ROUTES.ADDRESSES}
          className="flex min-h-[54px] items-center gap-3 px-4 py-3.5"
        >
          <span aria-hidden className="w-[22px] text-center text-[17px]">
            📍
          </span>
          <span className="flex-1 text-sm font-medium text-foreground">주소 설정</span>
          <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
