import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AdminShell } from '@/shared/components/AdminShell'
import { PlaceholderPage } from '@/shared/components/PlaceholderPage'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { EventsPage } from '@/features/events/pages/EventsPage'
import { ROUTES } from '@/shared/lib/routes'

export const router = createBrowserRouter([
  {
    // 인증 가드 + 데스크톱 사이드바 셸 — 자식 라우트가 <Outlet/> 에 렌더
    // (routing-convention §8 nested layout — pathless 부모 + 절대경로 자식)
    element: (
      <ProtectedRoute>
        <AdminShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.EVENTS} replace /> },
      { path: ROUTES.EVENTS, element: <EventsPage /> },
      // 나머지는 placeholder — 다음 핸드오프(공지·문의·운영도구)에서 실제 화면으로 교체
      { path: ROUTES.ANNOUNCEMENTS, element: <PlaceholderPage title="공지사항 관리" /> },
      { path: ROUTES.INQUIRIES, element: <PlaceholderPage title="문의 관리" /> },
      { path: ROUTES.OPS, element: <PlaceholderPage title="운영 도구" /> },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
])
