import { useEffect, useRef, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

/**
 * 앱 시작 시 refresh cookie 로 access token 을 복구한다.
 * access token 은 메모리에만 보관하므로 새로고침 후 이 부트스트랩이 라우터 렌더 전에 한 번 필요하다.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const markInitialized = useAuthStore((s) => s.markInitialized)
  const clear = useAuthStore((s) => s.clear)
  const started = useRef(false)

  useEffect(() => {
    if (isInitialized || started.current) return
    started.current = true

    if (accessToken) {
      markInitialized()
      return
    }

    authApi
      .refreshAccessToken()
      .then(({ accessToken: refreshedAccessToken }) => setAccessToken(refreshedAccessToken))
      .catch(() => clear())
  }, [accessToken, clear, isInitialized, markInitialized, setAccessToken])

  if (!isInitialized) return null
  return <>{children}</>
}
