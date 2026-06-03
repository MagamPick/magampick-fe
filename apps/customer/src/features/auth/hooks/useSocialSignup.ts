import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/authApi'
import { ROUTES } from '@/shared/lib/routes'
import type { SocialSignupInput } from '../types'

/**
 * 소셜 가입 제출 — 성공 시 welcome 으로 이동하며 accessToken 을 state 로 전달 (useSignup 과 동일).
 * 토큰 저장(자동 로그인)은 welcome 도착 후 처리한다 (소셜 가입 페이지를 감싼 PublicOnlyRoute 가
 * 토큰 감지 즉시 홈으로 가로채는 것을 방지).
 */
export function useSocialSignup() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: SocialSignupInput) => authApi.socialSignup(input),
    onSuccess: ({ accessToken }, input) => {
      navigate(ROUTES.WELCOME, { state: { accessToken, nickname: input.nickname } })
    },
  })
}
