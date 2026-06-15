import { env } from '@/shared/lib/env'
import { ROUTES } from '@/shared/lib/routes'

/** 카카오 인가 페이지 (카카오 호스팅 — FE 가 그리지 않는다) */
const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize'
/** dev 우회용 더미 인가코드 — 키 없는 로컬에서 BE local mock 가 프로필을 결정(계약: 키 없이 전체 흐름 테스트) */
const DEV_MOCK_CODE = 'dev-mock-code'

type NavigateLike = (to: { pathname: string; search?: string }) => void

/** redirect_uri 는 ①인가요청 / ②콜백교환에서 글자 단위로 동일해야 한다 (카카오 토큰 교환 검증). */
export function getKakaoRedirectUri(): string {
  return `${window.location.origin}${ROUTES.KAKAO_CALLBACK}`
}

export function buildKakaoAuthorizeUrl(params: {
  clientId: string
  redirectUri: string
  prompt?: 'consent' | 'login'
}): string {
  const search = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
  })
  if (params.prompt) search.set('prompt', params.prompt)
  return `${KAKAO_AUTHORIZE_URL}?${search.toString()}`
}

/**
 * 카카오 로그인 시작.
 * - REST 키 있음: 카카오 인가 페이지로 실제 리다이렉트(window.location). 콜백이 ?code 로 돌아온다.
 * - 키 없음(로컬 키리스): 카카오 왕복을 생략하고 콜백으로 더미 code 를 넘긴다 → BE local mock 가 분기.
 * prompt='consent' 는 이메일 미동의 후 재동의 유도(KAKAO_EMAIL_REQUIRED).
 */
export function startKakaoLogin(navigate: NavigateLike, prompt?: 'consent'): void {
  const clientId = env.VITE_KAKAO_CLIENT_ID
  if (clientId) {
    window.location.href = buildKakaoAuthorizeUrl({
      clientId,
      redirectUri: getKakaoRedirectUri(),
      prompt,
    })
    return
  }
  navigate({ pathname: ROUTES.KAKAO_CALLBACK, search: `?code=${DEV_MOCK_CODE}` })
}
