import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

/** 휴대폰 본인인증 — 인증번호 요청 + 확인 (BE 실연동, dev 환경은 000000 우회). 타이머/재전송은 컴포넌트 로컬 */
export function usePhoneVerification() {
  const request = useMutation({
    mutationFn: (phone: string) => authApi.requestPhoneVerification(phone),
  })
  const verify = useMutation({
    mutationFn: (input: { phone: string; code: string }) => authApi.verifyPhoneCode(input),
  })
  return { request, verify }
}
