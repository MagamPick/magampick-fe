import { apiClient } from '@/shared/lib/axios'

/**
 * FCM 디바이스 토큰 등록/해제. BE: POST/DELETE /api/v1/push-tokens (소비자·사장 공용).
 * 등록은 upsert(같은 토큰 재등록 시 소유자 재할당), 해제는 로그아웃 시.
 */
export async function registerPushToken(token: string): Promise<void> {
  await apiClient.post('/push-tokens', { token })
}

export async function deletePushToken(token: string): Promise<void> {
  await apiClient.delete('/push-tokens', { data: { token } })
}
