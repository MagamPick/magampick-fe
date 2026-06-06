import { create } from 'zustand'

export interface User {
  id: number
  role: 'CUSTOMER' | 'SELLER'
  email: string
  nickname?: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean

  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  markInitialized: () => void
  clear: () => void
}

/**
 * 인증 스토어 — access token 은 메모리만 (XSS 면역), persist 미사용 (auth.md §2).
 * 새로고침 시 null → silent refresh 가 채움 (연동 PR).
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: true, isInitialized: true }),
  setUser: (user) => set({ user }),
  markInitialized: () => set({ isInitialized: true }),
  clear: () => set({ accessToken: null, user: null, isAuthenticated: false, isInitialized: true }),
}))
