import { describe, it, expect, vi } from 'vitest'
import { buildKakaoAuthorizeUrl, startKakaoLogin } from './kakao'
import { ROUTES } from '@/shared/lib/routes'

describe('buildKakaoAuthorizeUrl', () => {
  it('kauth 인가 엔드포인트 + client_id·redirect_uri·response_type=code', () => {
    const url = buildKakaoAuthorizeUrl({
      clientId: 'KEY123',
      redirectUri: 'http://localhost:5173/login/kakao/callback',
    })
    const u = new URL(url)
    expect(u.origin + u.pathname).toBe('https://kauth.kakao.com/oauth/authorize')
    expect(u.searchParams.get('client_id')).toBe('KEY123')
    expect(u.searchParams.get('redirect_uri')).toBe('http://localhost:5173/login/kakao/callback')
    expect(u.searchParams.get('response_type')).toBe('code')
    expect(u.searchParams.get('prompt')).toBeNull()
  })

  it('prompt=consent 옵션을 추가', () => {
    const url = buildKakaoAuthorizeUrl({ clientId: 'K', redirectUri: 'http://x/cb', prompt: 'consent' })
    expect(new URL(url).searchParams.get('prompt')).toBe('consent')
  })
})

describe('startKakaoLogin — 키 없음(테스트 env) → dev 우회', () => {
  it('VITE_KAKAO_CLIENT_ID 미설정 시 콜백으로 더미 code 를 넘겨 BE local mock 가 분기하게 한다', () => {
    const navigate = vi.fn()
    startKakaoLogin(navigate)
    expect(navigate).toHaveBeenCalledTimes(1)
    const arg = navigate.mock.calls[0][0] as { pathname: string; search?: string }
    expect(arg.pathname).toBe(ROUTES.KAKAO_CALLBACK)
    expect(arg.search ?? '').toContain('code=')
  })
})
