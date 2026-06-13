import { apiClient } from '@/shared/lib/axios'
import { tokenResponseSchema, type LoginInput } from '../types'

export const authApi = {
  /**
   * POST /auth/admin/login — 관리자 로그인 (access 바디 + refresh HttpOnly 쿠키).
   * 사장/소비자와 달리 username + password (keepSignedIn 없음 — BE AdminLoginRequest 에 필드 없음).
   */
  async login(input: LoginInput): Promise<{ accessToken: string }> {
    const res = await apiClient.post('/auth/admin/login', input)
    return tokenResponseSchema.parse(res.data)
  },

  /**
   * POST /auth/refresh — refresh 쿠키로 access 재발급 (body 없음, 전 role 공통 EP).
   * role 은 refresh JWT claim 에 보존·복원되므로 admin 전용 refresh EP 가 필요 없다.
   */
  async refreshAccessToken(): Promise<{ accessToken: string }> {
    const res = await apiClient.post('/auth/refresh')
    return tokenResponseSchema.parse(res.data)
  },

  /** POST /auth/logout — Redis refresh 삭제 + 쿠키 만료 (204) */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },
}
