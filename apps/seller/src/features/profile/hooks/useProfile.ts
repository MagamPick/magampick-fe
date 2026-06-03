import { useQuery } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { profileKeys } from './profileQueryKeys'

/** 내 프로필(실명·이메일·휴대폰) 조회 — 마이 허브 헤더 + 내 정보 수정 화면 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => profileApi.getProfile(),
  })
}
