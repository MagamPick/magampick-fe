import { z } from 'zod'

/**
 * 런타임 환경 변수 (api-client-convention §3). 앱 시작 시 검증 — 누락/잘못된 값은 즉시 throw.
 * 새 VITE_* 변수는 이 스키마 + .env.example 양쪽에 추가한다.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  // FCM(웹 푸시) — 미설정 시 FCM 비활성(앱은 정상 동작). 값은 공개(클라 노출 정상).
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().optional(),
  VITE_FIREBASE_VAPID_KEY: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
