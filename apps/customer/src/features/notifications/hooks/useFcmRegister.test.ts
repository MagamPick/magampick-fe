import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// 인증됨으로 고정 — 훅이 FCM 등록 플로우를 실행하도록
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: true }),
}))

// FCM 설정 활성 + messaging 인스턴스 제공
vi.mock('@/shared/lib/firebase', () => ({
  getFirebaseMessaging: () => ({}),
  isFcmConfigured: true,
  VAPID_KEY: 'vapid-test',
}))

vi.mock('../api/pushTokenApi', () => ({
  registerPushToken: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('firebase/messaging', () => ({
  isSupported: vi.fn().mockResolvedValue(true),
  getToken: vi.fn().mockResolvedValue('fcm-token'),
  onMessage: vi.fn(),
}))

import { onMessage } from 'firebase/messaging'
import { useFcmRegister } from './useFcmRegister'

const showNotification = vi.fn()
let NotificationCtor: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()

  // 활성 상태의 가짜 SW 등록 — showNotification 스파이 포함
  const registration = { active: {}, showNotification }
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { register: vi.fn().mockResolvedValue(registration) },
  })

  // Notification: 권한은 granted, 생성자는 스파이(오용 감지용 — Android 에서 throw 하는 API)
  NotificationCtor = vi.fn()
  Object.assign(NotificationCtor, {
    requestPermission: vi.fn().mockResolvedValue('granted'),
    permission: 'granted',
  })
  vi.stubGlobal('Notification', NotificationCtor)
})

afterEach(() => vi.unstubAllGlobals())

describe('useFcmRegister 포그라운드 메시지', () => {
  it('포그라운드 수신 시 new Notification 대신 SW registration.showNotification 으로 표시한다', async () => {
    renderHook(() => useFcmRegister())

    // onMessage 핸들러가 등록될 때까지 대기
    await waitFor(() => expect(vi.mocked(onMessage)).toHaveBeenCalled())
    const handler = vi.mocked(onMessage).mock.calls[0][1] as (p: unknown) => void

    handler({
      data: {
        title: '떨이 알림',
        body: '근처 매장 떨이 등록',
        category: 'deal',
        notificationId: '7',
        link: '/',
      },
    })

    // SW 의 showNotification 으로 표시 — 클릭 라우팅에 쓸 data 동봉
    expect(showNotification).toHaveBeenCalledWith(
      '떨이 알림',
      expect.objectContaining({
        body: '근처 매장 떨이 등록',
        data: expect.objectContaining({ category: 'deal', notificationId: '7', link: '/' }),
      }),
    )
    // new Notification() 은 Android Chrome 에서 Illegal constructor 로 throw → 사용 금지
    expect(NotificationCtor).not.toHaveBeenCalled()
  })
})
