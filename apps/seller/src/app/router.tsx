import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { TabLayout } from '@/shared/components/TabLayout'
import { AnalyticsTab } from '@/shared/components/tabs/AnalyticsTab'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ROUTES } from '@/shared/lib/routes'
import { SellerHomePage } from '@/features/home/pages/SellerHomePage'
import { StoreManagePage } from '@/features/store/pages/StoreManagePage'
import { StoreHoursPage } from '@/features/store/pages/StoreHoursPage'
import { StoreEditPage } from '@/features/store/pages/StoreEditPage'
import { StoreRegisterPage } from '@/features/store/pages/StoreRegisterPage'
import { ProductListPage } from '@/features/product/pages/ProductListPage'
import { ProductCreatePage } from '@/features/product/pages/ProductCreatePage'
import { ProductDetailPage } from '@/features/product/pages/ProductDetailPage'
import { ProductEditPage } from '@/features/product/pages/ProductEditPage'
import { ClearanceCreatePage } from '@/features/clearance/pages/ClearanceCreatePage'
import { ClearanceDetailPage } from '@/features/clearance/pages/ClearanceDetailPage'
import { OrderListPage } from '@/features/order/pages/OrderListPage'
import { OrderDetailPage } from '@/features/order/pages/OrderDetailPage'
import { SellerMyPage } from '@/features/profile/pages/SellerMyPage'
import { EditProfilePage } from '@/features/profile/pages/EditProfilePage'
import { ReviewManagePage } from '@/features/reviews/pages/ReviewManagePage'
import { RefundManagePage } from '@/features/refund/pages/RefundManagePage'

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
      { index: true, element: <SellerHomePage /> },
      { path: ROUTES.ORDERS, element: <OrderListPage /> },
      { path: ROUTES.PRODUCTS, element: <ProductListPage /> },
      { path: ROUTES.ANALYTICS, element: <AnalyticsTab /> },
      { path: ROUTES.MYPAGE, element: <SellerMyPage /> },
    ],
  },
  // 풀스크린 보호 라우트 — 바텀네비 없음(홈·상품목록·마이에서 진입)
  {
    path: ROUTES.STORE_MANAGE,
    element: (
      <ProtectedRoute>
        <StoreManagePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STORE_HOURS,
    element: (
      <ProtectedRoute>
        <StoreHoursPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STORE_EDIT,
    element: (
      <ProtectedRoute>
        <StoreEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STORE_NEW,
    element: (
      <ProtectedRoute>
        <StoreRegisterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PRODUCT_NEW,
    element: (
      <ProtectedRoute>
        <ProductCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PRODUCT_EDIT(':id'),
    element: (
      <ProtectedRoute>
        <ProductEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PRODUCT_DETAIL(':id'),
    element: (
      <ProtectedRoute>
        <ProductDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CLEARANCE_NEW,
    element: (
      <ProtectedRoute>
        <ClearanceCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CLEARANCE_DETAIL(':id'),
    element: (
      <ProtectedRoute>
        <ClearanceDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ORDER_DETAIL(':id'),
    element: (
      <ProtectedRoute>
        <OrderDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REVIEWS,
    element: (
      <ProtectedRoute>
        <ReviewManagePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REFUNDS,
    element: (
      <ProtectedRoute>
        <RefundManagePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.EDIT_PROFILE,
    element: (
      <ProtectedRoute>
        <EditProfilePage />
      </ProtectedRoute>
    ),
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
  { path: '*', element: <NotFoundPage /> },
])
