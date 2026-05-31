import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '@/shared/lib/routes'
import type { LoginInput } from '../types'

/**
 * 로그인 — 성공 시 access 를 메모리(Auth state)에만 저장하고 홈으로 (auth.md §4).
 * refresh 는 서버가 HttpOnly cookie 로 내려주므로 클라이언트가 다루지 않는다.
 * 실패(LOGIN_FAILED 등)는 mutation.error 로 폼에서 표시.
 */
export function useLogin() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)
      navigate(ROUTES.HOME)
    },
  })
}
