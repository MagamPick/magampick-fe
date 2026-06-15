import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'

export default function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  )
}
