import { z } from 'zod'

/**
 * 런타임 환경 변수 (api-client-convention §3). 앱 시작 시 검증 — 누락/잘못된 값은 즉시 throw.
 * 새 VITE_* 변수는 이 스키마 + .env.example 양쪽에 추가한다.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  // 카카오 로그인 REST API 키(인가 리다이렉트용, 소비자 전용). 없으면 dev 우회(키리스 로컬 테스트).
  VITE_KAKAO_CLIENT_ID: z.string().optional(),
  // FCM(웹 푸시) — 미설정 시 FCM 비활성(앱은 정상 동작). 값은 공개(클라 노출 정상).
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().optional(),
  VITE_FIREBASE_VAPID_KEY: z.string().optional(),
  // 토스페이먼츠 API 개별 연동 클라이언트 키 (test_ck_* 형식). 결제창 흐름(prepare→토스→confirm)에 필수 —
  // 미설정 시 결제 시도 시 requestTossPaymentSdk 가 throw (order/lib/tossPaymentSdk).
  VITE_TOSS_CLIENT_KEY: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
