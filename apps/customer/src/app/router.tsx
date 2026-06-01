import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { TabLayout } from '@/shared/components/TabLayout'
import { FullscreenColumnLayout } from '@/shared/components/FullscreenColumnLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { StoreDetailPage } from '@/features/store-detail/pages/StoreDetailPage'
import { StoreLocationPage } from '@/features/store-detail/pages/StoreLocationPage'
import { ProductDetailPage } from '@/features/product-detail/pages/ProductDetailPage'
import { MapTab } from '@/shared/components/tabs/MapTab'
import { StoreListPage } from '@/features/store-list/pages/StoreListPage'
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage'
import { OrderListPage } from '@/features/order/pages/OrderListPage'
import { OrderDetailPage } from '@/features/order/pages/OrderDetailPage'
import { MyPage } from '@/features/profile/pages/MyPage'
import { EditProfilePage } from '@/features/profile/pages/EditProfilePage'
import { MyReviewsPage } from '@/features/reviews/pages/MyReviewsPage'
import { ReviewWritePage } from '@/features/reviews/pages/ReviewWritePage'
import { AddressListPage } from '@/features/addresses/pages/AddressListPage'
import { AddressFormPage } from '@/features/addresses/pages/AddressFormPage'
import { CartPage } from '@/features/cart/pages/CartPage'
import { CheckoutPage } from '@/features/order/pages/CheckoutPage'
import { OrderSuccessPage } from '@/features/order/pages/OrderSuccessPage'
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
      { path: ROUTES.ALL, element: <StoreListPage /> },
      { path: ROUTES.FAVS, element: <FavoritesPage /> },
      { path: ROUTES.ORDERS, element: <OrderListPage /> },
      { path: ROUTES.MYPAGE, element: <MyPage /> },
    ],
  },
  // 프로필(내 정보) 수정 — 풀스크린 보호 라우트 (바텀네비 없음, 프로토타입 59-edit-profile)
  {
    path: ROUTES.EDIT_PROFILE,
    element: (
      <ProtectedRoute>
        <EditProfilePage />
      </ProtectedRoute>
    ),
  },
  // 리뷰 — 내가 쓴 리뷰 목록 + 작성/수정 (TabLayout 밖 풀스크린). 작성/수정은 ReviewWritePage 겸용
  {
    path: ROUTES.MY_REVIEWS,
    element: (
      <ProtectedRoute>
        <MyReviewsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reviews/write/:orderId',
    element: (
      <ProtectedRoute>
        <ReviewWritePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reviews/:reviewId/edit',
    element: (
      <ProtectedRoute>
        <ReviewWritePage />
      </ProtectedRoute>
    ),
  },
  // 주소지 관리 — 탭이 아닌 독립 보호 라우트 (바텀네비 없음, 프로토타입 60-addresses 와 동일)
  {
    path: ROUTES.ADDRESSES,
    element: (
      <ProtectedRoute>
        <AddressListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/addresses/new',
    element: (
      <ProtectedRoute>
        <AddressFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/addresses/:id/edit',
    element: (
      <ProtectedRoute>
        <AddressFormPage />
      </ProtectedRoute>
    ),
  },
  // 장바구니 / 결제 / 주문 완료 — 탭 밖 독립 보호 라우트(바텀네비 없음, 프로토타입 40~42)
  {
    path: ROUTES.CART,
    element: (
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CHECKOUT,
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ORDER_SUCCESS,
    element: (
      <ProtectedRoute>
        <OrderSuccessPage />
      </ProtectedRoute>
    ),
  },
  // 주문 상세 — 풀스크린 보호 라우트 (바텀네비 없음, 프로토타입 50-order-detail)
  {
    path: '/orders/:id',
    element: (
      <ProtectedRoute>
        <OrderDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    // 상세 계열 — 인증 가드, 모바일 컬럼 풀스크린(바텀네비 없음). 파라미터 Zod 검증은 페이지 내부.
    element: (
      <ProtectedRoute>
        <FullscreenColumnLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/store/:id', element: <StoreDetailPage /> },
      { path: '/store/:id/location', element: <StoreLocationPage /> },
      { path: '/product/:kind/:productId', element: <ProductDetailPage /> },
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
