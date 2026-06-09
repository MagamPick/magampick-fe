import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, type Messaging } from 'firebase/messaging'
import { env } from './env'

/**
 * FCM(웹 푸시) 초기화. config 값은 공개(클라 노출 정상). 환경변수 미설정 시 비활성 —
 * getFirebaseMessaging() 가 undefined 를 반환하고 호출 측(useFcmRegister)이 조용히 skip 한다.
 *
 * 소비자와 같은 Firebase 프로젝트의 사장 전용 web app 을 쓴다(appId 만 다르고 나머지는 프로젝트 공통).
 * 토큰은 origin·appId 로 분리되고 BE 가 사용자/role 로 식별한다. config 값은 .env 의 VITE_FIREBASE_* 로 주입
 * (public/firebase-messaging-sw.js 의 하드코딩 appId 와 같은 값 유지).
 */
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

export const VAPID_KEY = env.VITE_FIREBASE_VAPID_KEY

export const isFcmConfigured = Boolean(
  config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.messagingSenderId &&
    config.appId &&
    VAPID_KEY,
)

let app: FirebaseApp | undefined
let messaging: Messaging | undefined

/** FCM Messaging 인스턴스. 미설정 시 undefined. */
export function getFirebaseMessaging(): Messaging | undefined {
  if (!isFcmConfigured) return undefined
  if (!messaging) {
    app ??= initializeApp(config)
    messaging = getMessaging(app)
  }
  return messaging
}
