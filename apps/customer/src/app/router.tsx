import { createBrowserRouter } from 'react-router'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ROUTES } from '@/shared/lib/routes'
import { HomePlaceholder } from '@/shared/components/HomePlaceholder'

export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <HomePlaceholder /> },
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
