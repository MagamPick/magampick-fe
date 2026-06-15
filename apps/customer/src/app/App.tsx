import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'
import { FcmRegistrar } from '@/features/notifications/components/FcmRegistrar'
import { LocationReporter } from '@/features/location/components/LocationReporter'
import { OfflineBanner } from '@/shared/components/OfflineBanner'
import { PwaUpdatePrompt } from '@/shared/components/PwaUpdatePrompt'
import { InstallPrompt } from '@/features/install/components/InstallPrompt'

export default function App() {
  return (
    <>
      {/* PWA 전역 오버레이 (pwa-convention §5·§6·§8) — 인증과 무관하게 항상 노출 */}
      <OfflineBanner />
      <InstallPrompt />
      <PwaUpdatePrompt />
      <AuthBootstrap>
        <FcmRegistrar />
        <LocationReporter />
        <RouterProvider router={router} />
      </AuthBootstrap>
    </>
  )
}
