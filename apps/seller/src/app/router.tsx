import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { PasswordResetPage } from '@/features/auth/pages/PasswordResetPage'
import { TabLayout } from '@/shared/components/TabLayout'
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage'
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
import { SettlementHistoryPage } from '@/features/settlement/pages/SettlementHistoryPage'
import { NoticeListPage } from '@/features/notices/pages/NoticeListPage'
import { SupportPage } from '@/features/support/pages/SupportPage'
import { InquiryFormPage } from '@/features/support/pages/InquiryFormPage'
import { InquiryDetailPage } from '@/features/support/pages/InquiryDetailPage'
import { NotificationCenterPage } from '@/features/notifications/pages/NotificationCenterPage'
import { NotificationSettingsPage } from '@/features/notifications/pages/NotificationSettingsPage'

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
      { path: ROUTES.ANALYTICS, element: <AnalyticsPage /> },
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
    path: ROUTES.SETTLEMENT,
    element: (
      <ProtectedRoute>
        <SettlementHistoryPage />
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
  // 공지사항 조회 + 고객센터(문의하기) — 마이 허브에서 진입, 풀스크린 보호 라우트 (Phase 11)
  {
    path: ROUTES.NOTICES,
    element: (
      <ProtectedRoute>
        <NoticeListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT,
    element: (
      <ProtectedRoute>
        <SupportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT_INQUIRY_NEW,
    element: (
      <ProtectedRoute>
        <InquiryFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/support/inquiry/:id',
    element: (
      <ProtectedRoute>
        <InquiryDetailPage />
      </ProtectedRoute>
    ),
  },
  // 알림센터 / 알림 설정 — 풀스크린 보호 라우트 (바텀네비 없음, 프로토타입 51 / 52)
  {
    path: ROUTES.NOTIFICATIONS,
    element: (
      <ProtectedRoute>
        <NotificationCenterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.NOTIFICATION_SETTINGS,
    element: (
      <ProtectedRoute>
        <NotificationSettingsPage />
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
  // 비밀번호 재설정 — 비로그인 전용 (로그인 화면 [비밀번호 찾기] 진입)
  {
    path: ROUTES.PASSWORD_RESET,
    element: (
      <PublicOnlyRoute>
        <PasswordResetPage />
      </PublicOnlyRoute>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
])
