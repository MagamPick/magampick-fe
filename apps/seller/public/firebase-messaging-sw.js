/* FCM 백그라운드 수신 서비스워커.
   번들러를 안 타므로 compat SDK(CDN) + config 하드코딩 — shared/lib/firebase.ts 의 값과 동일하게 유지할 것.
   config 값은 공개(클라이언트 노출 정상). 소비자와 같은 프로젝트의 사장 전용 web app — appId 만 다르고 나머지는 프로젝트 공통. */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAZKEHHnib2oq3Ly2z2P-Dku2wIiYOJ7JI',
  authDomain: 'magampick-57e27.firebaseapp.com',
  projectId: 'magampick-57e27',
  messagingSenderId: '788645182741',
  appId: '1:788645182741:web:711b1dd2abc7822f033d1c',
})

const messaging = firebase.messaging()

/**
 * category → 이동 경로 (사장). 번들을 안 타므로(plain JS) 소스의
 * src/features/notifications/lib/resolveNotificationLink.ts 와 수동 동기화할 것.
 * 미매칭(system/unknown)은 null → 이동 없음.
 */
function routeForCategory(category) {
  switch (category) {
    case 'order':
      return '/orders'
    case 'refund':
      return '/refunds'
    case 'review':
      return '/reviews'
    case 'settlement':
      return '/settlement'
    case 'notice':
      return '/notices'
    default:
      return null
  }
}

/** 앱 내부 절대경로 여부 — '/'로 시작(단 '//'·'/\' 외부 URL 제외). 소스 lib/resolveNotificationLink.ts 와 동기화 */
function isInternalPath(link) {
  return typeof link === 'string' && /^\/(?![/\\])/.test(link)
}

/**
 * 알림 클릭 시 이동할 경로 (하이브리드) — BE link(건별 딥링크) 우선 → category fallback.
 * 소스 lib/resolveNotificationLink.ts 와 수동 동기화할 것.
 */
function resolveNotificationLink(data) {
  if (isInternalPath(data.link)) return data.link
  return routeForCategory(data.category)
}

// BE 는 data-only 로 발송(notification 블록 없음) — 표시·클릭을 SW 가 단독 제어해 중복 표시를 막는다.
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {}
  self.registration.showNotification(data.title || '마감픽 알림', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    data: { category: data.category, notificationId: data.notificationId, link: data.link },
  })
})

// 알림 클릭 → 하이브리드 라우팅(link 우선→category) 앱 내 화면 이동. 열린 탭 있으면 focus(+best-effort navigate), 없으면 새 창.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  const route = resolveNotificationLink(data)
  if (!route) return
  const url = new URL(route, self.location.origin).href
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const existing = clientList.find((c) => new URL(c.url).origin === self.location.origin)
      if (existing) {
        await existing.focus()
        // navigate 는 이 SW 가 제어하지 않는 클라이언트(Workbox SW scope '/')에선 reject 될 수 있어 best-effort.
        if ('navigate' in existing) {
          try {
            await existing.navigate(url)
          } catch {
            /* 제어 밖 클라이언트 — focus 까지만 */
          }
        }
        return
      }
      await self.clients.openWindow(url)
    })(),
  )
})
