import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { profileKeys } from './profileQueryKeys'

/**
 * 실명 수정 (노션 "사장 프로필 관리": 2~20자, 가명·별명 금지).
 * 성공 시 프로필 쿼리 무효화 → 마이 허브·내 정보 수정 화면 즉시 반영.
 */
export function useUpdateName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => profileApi.updateName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}
