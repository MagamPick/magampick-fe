import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/**
 * 비밀번호 변경 (로그인 상태) — 현재 비번 확인 후 새 비번 갱신.
 * 성공 후 현재 기기 세션 유지(재로그인 X — 노션 「비밀번호 변경」 명세).
 */
export function usePasswordChange() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(input),
  })
}
