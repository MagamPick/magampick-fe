import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { profileKeys } from './profileQueryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'

/**
 * 닉네임 수정 (노션 "소비자 프로필 관리": 2~12자, 중복 허용).
 * 성공 시 프로필 쿼리 무효화 + authStore 사용자 닉네임 동기화(헤더 등 다른 소비처 즉시 반영).
 */
export function useUpdateNickname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nickname: string) => profileApi.updateNickname(nickname),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
      const { user, setUser } = useAuthStore.getState()
      if (user) setUser({ ...user, nickname: updated.nickname })
    },
  })
}
