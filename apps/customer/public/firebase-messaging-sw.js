/* FCM 백그라운드 수신 서비스워커.
   번들러를 안 타므로 compat SDK(CDN) + config 하드코딩 — shared/lib/firebase.ts 의 값과 동일하게 유지할 것.
   config 값은 공개(클라이언트 노출 정상). */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAZKEHHnib2oq3Ly2z2P-Dku2wIiYOJ7JI',
  authDomain: 'magampick-57e27.firebaseapp.com',
  projectId: 'magampick-57e27',
  messagingSenderId: '788645182741',
  appId: '1:788645182741:web:01168ea8dcf5e40e033d1c',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192.png',
  })
})
