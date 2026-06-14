import { useEffect, useRef, useState, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

/**
 * 앱 시작 시 refresh 쿠키로 access token 을 복구한다 (auth.md — access 는 메모리 보관).
 * 사장 앱엔 그동안 이게 없어 새로고침/재접속 시 로그아웃됐다 (findings BUG-C, 소비자·관리자엔 존재).
 * 부팅(refresh in-flight) 동안에는 라우터(children) 렌더를 보류(null)해 로그인 화면 깜빡임을 막는다.
 * refresh 실패(REFRESH_INVALID/쿠키 없음)는 삼키고 비로그인 상태로 진행 — 가드가 /login 으로 보낸다.
 * 루프 없음: refresh 실패 코드는 REFRESH_INVALID(≠TOKEN_EXPIRED)라 axios 인터셉터의 재시도에 안 걸린다.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const [bootstrapped, setBootstrapped] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    authApi
      .refreshAccessToken()
      .then(({ accessToken }) => setAccessToken(accessToken))
      .catch(() => {
        // refresh 쿠키 없음/만료 → 비로그인 상태 유지. 에러 삼킴.
      })
      .finally(() => setBootstrapped(true))
  }, [setAccessToken])

  if (!bootstrapped) return null
  return <>{children}</>
}
