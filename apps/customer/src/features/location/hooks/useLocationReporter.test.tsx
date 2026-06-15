import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../api/locationApi', () => ({
  locationApi: { updateMyLocation: vi.fn().mockResolvedValue({}) },
}))
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))
vi.mock('@/features/notifications/hooks/useNotificationSettings', () => ({
  useNotificationSettings: vi.fn(),
}))

import { locationApi } from '../api/locationApi'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNotificationSettings } from '@/features/notifications/hooks/useNotificationSettings'
import { useLocationReporter } from './useLocationReporter'

const mockedUpdate = vi.mocked(locationApi.updateMyLocation)
// useAuthStore 는 zustand 바운드 스토어(셀렉터 오버로드) — 셀렉터 타입을 좁히지 않게 느슨한 Mock 으로
const mockedAuth = useAuthStore as unknown as Mock
const mockedSettings = vi.mocked(useNotificationSettings)

const getCurrentPosition = vi.fn()

function setup({ authed = true, nearbyDeal = true } = {}) {
  // useAuthStore((s) => s.isAuthenticated) 형태 — selector 에 상태를 흘려준다
  mockedAuth.mockImplementation((selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: authed }),
  )
  mockedSettings.mockReturnValue({ data: { nearbyDeal } } as ReturnType<
    typeof useNotificationSettings
  >)
  return renderHook(() => useLocationReporter())
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition },
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useLocationReporter', () => {
  it('인증+주변떨이 ON 이고 GPS 성공이면 현재 좌표를 PUT 한다', () => {
    getCurrentPosition.mockImplementation((success: PositionCallback) =>
      success({ coords: { latitude: 37.5, longitude: 127.0 } } as GeolocationPosition),
    )

    setup({ authed: true, nearbyDeal: true })

    expect(getCurrentPosition).toHaveBeenCalled()
    expect(mockedUpdate).toHaveBeenCalledWith({ latitude: 37.5, longitude: 127.0 })
  })

  it('주변떨이 OFF 면 위치를 요청/전송하지 않는다', () => {
    setup({ authed: true, nearbyDeal: false })

    expect(getCurrentPosition).not.toHaveBeenCalled()
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('미인증이면 위치를 요청/전송하지 않는다', () => {
    setup({ authed: false, nearbyDeal: true })

    expect(getCurrentPosition).not.toHaveBeenCalled()
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('GPS 실패(권한 거부 등)면 PUT 하지 않는다 — fallback 좌표를 보내지 않는다', () => {
    getCurrentPosition.mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 1 } as GeolocationPositionError),
    )

    setup({ authed: true, nearbyDeal: true })

    expect(getCurrentPosition).toHaveBeenCalled()
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('포그라운드 유지 중 5분 주기로 다시 보고한다', () => {
    getCurrentPosition.mockImplementation((success: PositionCallback) =>
      success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition),
    )

    setup({ authed: true, nearbyDeal: true })
    expect(mockedUpdate).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5 * 60 * 1000)
    expect(mockedUpdate).toHaveBeenCalledTimes(2)
  })

  it('백그라운드→포그라운드 복귀 시 1회 다시 보고한다', () => {
    getCurrentPosition.mockImplementation((success: PositionCallback) =>
      success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition),
    )
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })

    setup({ authed: true, nearbyDeal: true })
    expect(mockedUpdate).toHaveBeenCalledTimes(1) // 런치 1회

    document.dispatchEvent(new Event('visibilitychange'))
    expect(mockedUpdate).toHaveBeenCalledTimes(2)
  })
})
