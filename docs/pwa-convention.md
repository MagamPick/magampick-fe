# PWA Convention

vite-plugin-pwa + Workbox + Firebase Cloud Messaging (FCM). **`apps/customer` / `apps/seller` 만 적용** — `apps/admin` 은 일반 웹.

---

## 1. PWA 핵심 — 3가지 구성

| 요소 | 역할 |
|---|---|
| **Manifest** (`manifest.webmanifest`) | 앱 메타 (이름 / 아이콘 / theme / display) — 홈 화면 추가 가능 |
| **Service Worker** | 백그라운드 스크립트 — 캐싱 / 오프라인 / 푸시 알림 수신 |
| **HTTPS** | Service Worker 동작 필수 (localhost 만 예외) |

→ vite-plugin-pwa 가 위 세 가지 자동 셋업.

---

## 2. vite-plugin-pwa 셋업

`apps/customer/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',         // 새 SW 자동 활성화
      injectRegister: 'auto',
      manifest: {
        name: '마감픽 - 마감 임박 할인 픽업',
        short_name: '마감픽',
        description: '주변 베이커리 / 카페의 마감 임박 상품을 할인된 가격에 픽업하세요',
        theme_color: '#000000',           // 디자인 토큰
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 캐싱 전략 — §4 참조
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.magampick\.com\/api\/v1\/(stores|products|clearance-items)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },  // 5분
              networkTimeoutSeconds: 3,
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },  // 7일
            }
          },
        ],
        navigateFallback: '/index.html',   // SPA fallback
      },
      devOptions: {
        enabled: true,                      // 개발 모드에서도 PWA 테스트 가능
      },
    })
  ],
  // ... 기존 설정
})
```

> `apps/seller` 도 동일 패턴 — name / short_name / theme 만 다르게.
> `apps/admin` 은 PWA 적용 X — `VitePWA` 플러그인 자체 사용 안 함.

---

## 3. Manifest 디테일

### 아이콘 (필수)

| 크기 | 용도 |
|---|---|
| 192x192 | 일반 |
| 512x512 | 큰 크기 (스플래시 등) |
| 512x512 maskable | Android adaptive icon |

→ `apps/{name}/public/icons/` 에 PNG 파일 배치. 디자인 팀원 제공.

### `display` 옵션

| 값 | 동작 |
|---|---|
| **`standalone`** (채택) | 브라우저 UI 없이 별도 앱처럼 동작 (URL bar X) |
| `fullscreen` | 전체 화면 (상태바도 X) — 게임 / 미디어 |
| `minimal-ui` | 최소 UI (back / forward 정도) |
| `browser` | 일반 브라우저 |

→ **`standalone`** — 모바일에서 설치 후 앱처럼 느껴짐.

### theme / background color

- `theme_color` — 상태바 / 탭 색 (디자인 토큰의 primary)
- `background_color` — 스플래시 배경 (디자인 토큰의 background)

---

## 4. Workbox 캐싱 전략

| 전략 | 동작 | 적용 영역 |
|---|---|---|
| **NetworkFirst** | 네트워크 시도 → 실패 시 캐시 | API 응답 (실시간성 필요) |
| **CacheFirst** | 캐시 시도 → 없으면 네트워크 | 이미지 / 폰트 / 정적 파일 |
| **StaleWhileRevalidate** | 캐시 즉시 반환 + 백그라운드 refetch | 자주 안 바뀌는 정적 데이터 |
| **NetworkOnly** | 항상 네트워크 (캐시 X) | 결제 / 인증 / mutation |

### 마감픽 적용

| 패턴 | 전략 | 이유 |
|---|---|---|
| `/api/v1/stores`, `/products`, `/clearance-items` (조회) | **NetworkFirst** (5분 캐시) | 마감 임박 상품 = 실시간성 우선 / 오프라인 대비 캐시 |
| `/api/v1/auth/**`, `/orders/**` (인증·주문) | **NetworkOnly** (캐싱 X) | 보안 / 정확성 |
| 이미지 (상품 / 매장) | **CacheFirst** (7일) | 거의 안 바뀜 |
| 정적 자산 (JS / CSS / 폰트) | **precache** (자동) | Workbox 가 빌드 시 자동 등록 |

### precache vs runtime cache

- **precache** — 빌드 시점에 SW 가 다운로드. 앱 처음 시작할 때 미리 캐싱.
- **runtime cache** — 실제 요청 시점에 캐싱. `runtimeCaching` 옵션.

---

## 5. 자동 업데이트

```ts
VitePWA({ registerType: 'autoUpdate' })
```

→ 새 버전 배포 시 다음 방문 때 자동 SW 교체. 사용자 인지 없음.

다만 **앱이 열린 상태에서 새 버전 배포** 되면 알림이 자연스러움:

```tsx
// app/components/PWAUpdater.tsx
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PWAUpdater() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <Toast>
      새 버전이 있습니다
      <Button onClick={() => updateServiceWorker(true)}>새로고침</Button>
    </Toast>
  )
}
```

`app/App.tsx` 에 추가.

---

## 6. 오프라인 처리

### 네트워크 상태 감지

```ts
// shared/hooks/useOnline.ts
export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

### UX

- **읽기 화면** — 캐시된 데이터 표시 + "오프라인" 배너
- **쓰기 (주문 / 결제)** — 즉시 차단 + 안내 ("연결을 확인하고 다시 시도해주세요")
- 오프라인 큐 / 동기화 = MVP 비범위

---

## 7. Firebase Cloud Messaging (FCM)

### Firebase 셋업

```sh
pnpm add firebase
```

`shared/lib/firebase.ts`:

```ts
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseApp = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

export const messaging = getMessaging(firebaseApp)
```

### Service Worker — Firebase 통합

`public/firebase-messaging-sw.js` (vite-plugin-pwa 의 SW 와 별도 — Firebase 전용):

```js
importScripts('https://www.gstatic.com/firebasejs/10.x/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.x/firebase-messaging-compat.js')

firebase.initializeApp({ /* config */ })
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192.png',
  })
})
```

> vite-plugin-pwa 의 SW (`sw.js`) 와 Firebase SW (`firebase-messaging-sw.js`) 가 별도 등록. 두 SW 가 같은 origin 에서 공존 가능.

### 권한 요청 + 토큰 등록

```ts
// features/notifications/hooks/useFCMRegister.ts
import { getToken } from 'firebase/messaging'
import { messaging } from '@/shared/lib/firebase'
import { notificationApi } from '../api/notificationApi'

export function useFCMRegister() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    Notification.requestPermission().then(async (permission) => {
      if (permission !== 'granted') return

      const token = await getToken(messaging, {
        vapidKey: env.VITE_FIREBASE_VAPID_KEY
      })

      // 백엔드에 FCM 토큰 저장 (사용자별)
      await notificationApi.registerToken(token)
    })
  }, [isAuthenticated])
}
```

### Foreground 메시지 처리

```ts
onMessage(messaging, (payload) => {
  toast.info(payload.notification?.title, {
    description: payload.notification?.body,
  })
})
```

### 권한 UX

- **로그인 후 자연스러운 시점** 에 권한 요청 (앱 진입 즉시 X — 거부율 ↑)
- 예: 첫 주문 완료 후 / 사장이 첫 상품 등록 후 / 명시적 "알림 켜기" 버튼

---

## 8. 설치 prompt — beforeinstallprompt

Android Chrome / Edge 에서 사용자가 PWA 설치할 수 있는 prompt 트리거.

```tsx
// features/install/hooks/useInstallPrompt.ts
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return {
    canInstall: prompt !== null,
    install: () => prompt?.prompt(),
  }
}
```

UI 에 "앱으로 설치" 버튼 노출. iOS Safari 는 prompt 지원 X — "공유 → 홈 화면 추가" 안내만.

---

## 9. Geolocation API

```ts
// shared/hooks/useGeolocation.ts
export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationPositionError | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    const id = navigator.geolocation.watchPosition(
      setPosition,
      setError,
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return { position, error }
}
```

### 정책

- **HTTPS 필수** — 모든 환경에서. localhost 만 예외
- **명시적 권한 요청** — 첫 위치 사용 직전에 안내 모달 → 사용자 동의 후 호출
- **거부 시 폴백** — 위치 입력 폼 또는 기본 위치 (강남역 등) 안내

---

## 10. 앱별 차이 (customer / seller)

| | customer | seller |
|---|---|---|
| **Manifest** | "마감픽" / 소비자용 아이콘 / 디자인 토큰의 primary | "마감픽 사장" / 사장용 아이콘 / 다른 theme color (구분 위해) |
| **start_url** | `/` (홈 — 위치 기반 매장 목록) | `/` (사장 대시보드) |
| **FCM topic / 채널** | `customer:{id}` — 주문 상태 변경 알림 | `seller:{id}` — 새 주문 / 픽업 완료 알림 |
| **Geolocation** | 적극 사용 (위치 기반 매장 검색) | 선택 사용 (매장 등록 시 좌표 등) |
| **권한 요청 시점** | 로그인 후 + 첫 위치 검색 직전 | 로그인 후 + 첫 새 주문 안내 직전 |

`apps/admin` — PWA 미적용. Geolocation X / FCM X / Manifest X / Service Worker X.

---

## 11. 환경 변수

```
# apps/customer/.env.example
VITE_API_BASE_URL=https://api.magampick.com
VITE_KAKAO_CLIENT_ID=...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...

# apps/seller/.env.example — Firebase 별도 프로젝트 또는 같은 프로젝트의 다른 web app
# (FCM 토픽 분리만 한다면 같은 프로젝트도 OK)

# apps/admin/.env.example
VITE_API_BASE_URL=...
# FCM / Firebase 환경 변수 없음 (PWA 미적용)
```

---

## 12. 테스트

- **Service Worker** 는 Vitest 에선 테스트 어려움 — Playwright E2E 가 검증 (`e2e/pwa.spec.ts`)
- **Manifest** 검증 — Lighthouse 또는 Playwright 의 `page.evaluate` 로 manifest 객체 검사
- **FCM** — Firebase Emulator 또는 mock — MVP 에선 수동 검증으로 충분

---

## 13. 안티 패턴

- ❌ **앱 시작 즉시 알림 권한 요청** — 거부율 90%+. 자연스러운 시점에
- ❌ **`navigator.serviceWorker.register` 직접** — vite-plugin-pwa 가 처리. 직접 X
- ❌ **mutation API 까지 캐싱** — 결제 / 주문 같은 거 캐싱하면 중복 처리 위험. NetworkOnly
- ❌ **거대 SW 파일** — Workbox 가 자동 분할 / 최적화. 수동 작성 X
- ❌ **CacheFirst 를 API 응답에** — 데이터 stale 위험. NetworkFirst 또는 StaleWhileRevalidate
- ❌ **`admin` 앱에 PWA 적용** — 데스크탑 일반 웹 (정책)

---

## 14. 라이브러리

```json
{
  "vite-plugin-pwa": "^0.x",
  "workbox-window": "^7.x",        // virtual:pwa-register/react 의존
  "firebase": "^10.x"
}
```

---

## 보류 / TODO (코드 작성 / 운영 시점에 정확화)

> docs 본문의 숫자 / 정책 중 **추정값 / 디자인 미수령** 항목. 작업 시점에 확정.

- [ ] **API 캐싱 시간 5분** — 마감 임박 상품 갱신 빈도 확인 후 조정 (1분 / 5분 / 10분 후보)
- [ ] **이미지 캐싱 시간 7일** — 상품 이미지 갱신 빈도 확인 후 조정
- [ ] **FCM 알림 종류 / 트리거** — 노션 알림 명세 페이지 만들어질 때 정확화 (현재는 일반적 추정: 주문 상태 변경 / 새 주문 등)
- [ ] **권한 요청 UX 시점** (위치 / 알림) — 화면 작업 시 결정. 현재는 "자연스러운 시점" 가이드라인만
- [ ] **theme_color / background_color / 아이콘 / 앱 이름** — 디자인 팀원의 디자인 토큰 / 에셋 받을 때 확정
- [ ] **디바이스 / 브라우저 지원 범위 명시** — 노션 / product.md 의 명시 (현재는 product.md 의 FCM iOS 16.4+ 만)
- [ ] **오프라인 큐 / 동기화** — MVP 비범위. 출시 후 사용자 피드백 보고 검토

## 변경 이력
- 2026-05-29: 초안 작성.
