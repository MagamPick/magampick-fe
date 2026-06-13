import { useMutation } from '@tanstack/react-query'
import { opsApi } from '../api/opsApi'

/** SMS 발송기 mock/실발송 전환. enabled=true→mock, false→실발송. 성공/에러 표시는 호출 측(SmsMockCard). */
export function useSetSmsMock() {
  return useMutation({
    mutationFn: (enabled: boolean) => opsApi.setSmsMock(enabled),
  })
}
