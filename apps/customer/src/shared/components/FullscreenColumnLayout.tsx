import { Outlet } from 'react-router'

/**
 * 탭 밖 독립 풀스크린 화면용 컬럼 셸.
 * 자식 화면은 `ScreenContainer variant="bleed"` 로 히어로/지도 풀블리드를 유지하고,
 * 이 부모가 데스크탑에서 customer PWA 폭을 제한한다.
 */
export function FullscreenColumnLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-card">
      <Outlet />
    </div>
  )
}
