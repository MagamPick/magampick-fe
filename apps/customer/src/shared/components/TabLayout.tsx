import { Outlet } from 'react-router'
import { BottomNav } from './BottomNav'

/**
 * 로그인 이후 메인 탭 셸 — 페이지(`<Outlet/>`) 위에 플로팅 바텀 네비를 얹는다.
 *
 * 라우터 연결(이 셸을 레이아웃 라우트로 꽂고 자식 탭을 매핑)은 이번 PR 범위 밖 —
 * login/logout 머지 후 별도 PR. 지금은 컴포넌트만.
 *
 * 떠 있는 네비가 콘텐츠를 가리지 않도록 본문 하단 패딩 보정
 * (네비 높이 64 + 위 8 + 안전영역(폴백 24) + 여유 12 — 프로토타입 `.tab-body` 와 동일).
 */
export function TabLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col pb-[calc(64px+8px+env(safe-area-inset-bottom,24px)+12px)]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
