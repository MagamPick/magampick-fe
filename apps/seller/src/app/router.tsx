import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ROUTES } from '@/shared/lib/routes'
import { SellerHomePage } from '@/features/home/pages/SellerHomePage'
import { StoreManagePage } from '@/features/store/pages/StoreManagePage'
import { StoreHoursPage } from '@/features/store/pages/StoreHoursPage'
import { SellerMyPage } from '@/features/profile/pages/SellerMyPage'
import { EditProfilePage } from '@/features/profile/pages/EditProfilePage'

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <SellerHomePage />
      </ProtectedRoute>
    ),
  },
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
    path: ROUTES.MYPAGE,
    element: (
      <ProtectedRoute>
        <SellerMyPage />
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
