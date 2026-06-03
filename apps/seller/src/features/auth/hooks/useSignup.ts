import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/authApi'
import { ROUTES } from '@/shared/lib/routes'
import { useAuthStore } from '../stores/authStore'
import type { SignupInput } from '../types'

/**
 * 사장 회원가입 제출 — 성공 시 자동 로그인(access token 저장) 후 사장 메인으로 이동.
 * 소비자와 달리 환영 페이지를 거치지 않는다 (노션 명세: 가입 완료 = 자동 로그인 + 사장 메인 직행).
 */
export function useSignup() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)
      navigate(ROUTES.HOME, { replace: true })
    },
  })
}
