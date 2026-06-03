import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '@/shared/lib/routes'
import type { KakaoScenario } from '../types'

/**
 * 카카오 로그인 — mock authorize 결과로 분기 (소셜 로그인 명세).
 * - 기존 회원: access 를 메모리에 저장하고 홈으로 (useLogin 과 동일).
 * - 신규 회원: 카카오 프로필을 들고 소셜 가입(추가정보)으로 이동. 토큰은 가입 완료 후 발급.
 * 에러(KAKAO_EMAIL_REQUIRED / EMAIL_ALREADY_REGISTERED 등)는 mutation.error 로 콜백 화면이 처리.
 */
export function useKakaoLogin() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  return useMutation({
    mutationFn: (scenario: KakaoScenario) => authApi.kakaoAuthorize(scenario),
    onSuccess: (result) => {
      if (result.status === 'existing') {
        setAccessToken(result.accessToken)
        navigate(ROUTES.HOME)
      } else {
        navigate(ROUTES.SOCIAL_SIGNUP, { state: { profile: result.profile } })
      }
    },
  })
}
