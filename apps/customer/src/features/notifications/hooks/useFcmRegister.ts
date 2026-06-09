import { useEffect, useRef } from 'react'
import { getToken, isSupported, onMessage } from 'firebase/messaging'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { getFirebaseMessaging, isFcmConfigured, VAPID_KEY } from '@/shared/lib/firebase'
import { registerPushToken } from '../api/pushTokenApi'

/**
 * SW 가 active 될 때까지 대기. getToken 의 pushManager.subscribe 는 active SW 를 요구하는데,
 * register() 는 활성화 전에 resolve 되므로 콜드 첫 등록에선 'no active Service Worker' 로 실패할 수 있다.
 * 안전장치로 타임아웃을 둔다(끝내 미활성이면 getToken 이 알아서 실패→catch 로 떨어진다).
 */
function waitForActiveServiceWorker(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.active) return Promise.resolve()
  const sw = registration.installing ?? registration.waiting
  if (!sw) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => resolve(), 10_000)
    sw.addEventListener('statechange', () => {
      if (sw.state === 'activated') {
        clearTimeout(timer)
        resolve()
      }
    })
  })
}

/**
 * 로그인(인증) 후 FCM 토큰을 발급받아 BE 에 등록한다. 앱 로드당 한 번만 실행.
 * - FCM 미설정/미지원/권한 거부 시 조용히 skip (앱 정상 동작)
 * - 포그라운드 메시지는 FCM 이 자동 표시하지 않으므로 직접 Notification 으로 표시
 *
 * 권한 요청 시점: pwa-convention 은 "자연스러운 시점(버튼)"을 권장 — 현재는 로그인 직후(가장 단순).
 * 추후 명시적 "알림 켜기" 버튼으로 이동 가능(보류 항목).
 */
export function useFcmRegister(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const started = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || started.current || !isFcmConfigured) return
    started.current = true

    void (async () => {
      try {
        if (!('serviceWorker' in navigator) || !(await isSupported())) return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // 별도 scope 로 등록 — vite-plugin-pwa 의 Workbox SW(scope '/')와 충돌 방지.
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope',
        })
        // 활성화 전 getToken 호출 방지(콜드 첫 등록 레이스) — register() 는 활성화 전에 resolve 된다.
        await waitForActiveServiceWorker(registration)
        const messaging = getFirebaseMessaging()
        if (!messaging) return

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        })
        if (!token) return
        await registerPushToken(token)

        onMessage(messaging, (payload) => {
          const title = payload.notification?.title
          if (title) new Notification(title, { body: payload.notification?.body })
        })
      } catch (error) {
        console.error('[FCM] 토큰 등록 실패', error)
      }
    })()
  }, [isAuthenticated])
}
