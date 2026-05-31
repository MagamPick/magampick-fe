import { createBrowserRouter } from 'react-router'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ROUTES } from '@/shared/lib/routes'
import { SellerHomePage } from '@/features/home/pages/SellerHomePage'

export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <SellerHomePage /> },
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
