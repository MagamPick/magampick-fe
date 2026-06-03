import { Outlet } from 'react-router'
import { BottomNav } from './BottomNav'

/**
 * 사장 로그인 이후 메인 탭 셸 — 페이지(`<Outlet/>`) 위에 플로팅 바텀 네비를 얹는다.
 * 소비자 `TabLayout` 미러. 라우터에서 pathless 부모 라우트(`ProtectedRoute` + 이 셸)로 꽂고
 * 홈·주문·상품·통계·마이 탭을 자식으로 매핑한다(`app/router.tsx`).
 *
 * 폭은 모바일 컬럼(`max-w-md`)으로 제한하고 데스크탑에선 가운데 정렬 — styling-convention §8
 * (PWA = desktop max-width 컨테이너)과 통일. 플로팅 네비도 같은 폭에 맞춰 중앙 고정(`BottomNav`).
 *
 * 떠 있는 네비가 콘텐츠를 가리지 않도록 본문 하단 패딩 보정
 * (네비 높이 64 + 위 8 + 안전영역(폴백 24) + 여유 12 — 프로토타입 `.tab-body` 와 동일).
 */
export function TabLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <main className="flex flex-1 flex-col bg-card pb-[calc(64px+8px+env(safe-area-inset-bottom,24px)+12px)]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
