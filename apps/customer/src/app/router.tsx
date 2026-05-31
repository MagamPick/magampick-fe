import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { TabLayout } from '@/shared/components/TabLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { MapTab } from '@/shared/components/tabs/MapTab'
import { AllTab } from '@/shared/components/tabs/AllTab'
import { FavsTab } from '@/shared/components/tabs/FavsTab'
import { OrdersTab } from '@/shared/components/tabs/OrdersTab'
import { MyTab } from '@/shared/components/tabs/MyTab'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ROUTES } from '@/shared/lib/routes'

export const router = createBrowserRouter([
  {
    // 로그인 후 메인 탭 셸 — 인증 가드 + 공통 레이아웃(바텀네비). 자식 탭이 <Outlet/> 에 렌더.
    // (routing-convention §8 nested layout — pathless 부모 + 절대경로 자식)
    element: (
      <ProtectedRoute>
        <TabLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.MAP, element: <MapTab /> },
      { path: ROUTES.ALL, element: <AllTab /> },
      { path: ROUTES.FAVS, element: <FavsTab /> },
      { path: ROUTES.ORDERS, element: <OrdersTab /> },
      { path: ROUTES.MYPAGE, element: <MyTab /> },
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
  {
    path: ROUTES.SIGNUP,
    element: (
      <PublicOnlyRoute>
        <SignupPage />
      </PublicOnlyRoute>
    ),
  },
  { path: ROUTES.WELCOME, element: <WelcomePage /> },
  { path: '*', element: <NotFoundPage /> },
])
