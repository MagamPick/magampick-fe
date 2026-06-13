import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { ROUTES } from '@/shared/lib/routes'

/** 비로그인 전용 라우트 가드 — 로그인 상태면 이벤트 관리로 (auth.md §10) */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to={ROUTES.EVENTS} replace />
  return <>{children}</>
}
