import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/** 이메일 중복 확인 — Step 2 [중복확인] 버튼에서 호출 (mutation) */
export function useEmailCheck() {
  return useMutation({
    mutationFn: (email: string) => authApi.checkEmail(email),
  })
}
