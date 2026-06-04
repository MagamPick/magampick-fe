import { z } from 'zod'

/**
 * 런타임 환경 변수 (api-client-convention §3). 앱 시작 시 검증 — 누락/잘못된 값은 즉시 throw.
 * 새 VITE_* 변수는 이 스키마 + .env.example 양쪽에 추가한다.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  // 카카오 로그인 REST API 키(인가 리다이렉트용, 소비자 전용). 없으면 dev 우회(키리스 로컬 테스트).
  VITE_KAKAO_CLIENT_ID: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
