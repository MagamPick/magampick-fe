import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '@/shared/lib/routes'

/**
 * 로그아웃 (auth.md §7) — 서버에 refresh 무효화를 요청하고, 성공/실패와 무관하게
 * onSettled 에서 클라이언트를 정리한다 (사용자 입장에선 항상 로그아웃).
 * queryClient.clear() 로 캐시를 비워 다음 사용자가 이전 데이터를 보지 못하게 한다.
 */
export function useLogout() {
  const navigate = useNavigate()
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear()
      queryClient.clear()
      navigate(ROUTES.LOGIN)
    },
  })
}
