import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'
import { FcmRegistrar } from '@/features/notifications/components/FcmRegistrar'
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
      {/* refresh 쿠키로 access 복구가 끝난 뒤 라우터·FCM 등록을 띄운다 (새로고침=로그아웃 방지) */}
      <AuthBootstrap>
        <FcmRegistrar />
        <RouterProvider router={router} />
      </AuthBootstrap>
    </>
  )
}
