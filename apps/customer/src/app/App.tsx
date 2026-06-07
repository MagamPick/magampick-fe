import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'
import { FcmRegistrar } from '@/features/notifications/components/FcmRegistrar'

export default function App() {
  return (
    <AuthBootstrap>
      <FcmRegistrar />
      <RouterProvider router={router} />
    </AuthBootstrap>
  )
}
