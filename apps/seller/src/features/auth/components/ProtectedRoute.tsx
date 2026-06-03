import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { ROUTES } from '@/shared/lib/routes'

/** 인증 전용 라우트 가드 — 비로그인 시 로그인 화면으로 (auth.md §10) */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  return <>{children}</>
}
