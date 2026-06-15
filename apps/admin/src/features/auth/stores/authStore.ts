import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean

  setAccessToken: (token: string) => void
  clear: () => void
}

/**
 * 인증 스토어 — access token 은 메모리만 (XSS 면역), persist 미사용 (auth.md §2).
 * admin 은 프로필 조회 EP 가 없고 role 은 항상 ADMIN — 토큰 존재 = 인증 (User 객체 없음).
 * 새로고침 시 null → AuthBootstrap 의 silent refresh 가 채운다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  clear: () => set({ accessToken: null, isAuthenticated: false }),
}))
