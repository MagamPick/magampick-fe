import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNotificationSettings } from '@/features/notifications/hooks/useNotificationSettings'
import { locationApi } from '../api/locationApi'

/** 보고 주기 — 포그라운드 유지 중 5분 */
const REPORT_INTERVAL_MS = 5 * 60 * 1000

/** 3km 타겟엔 저정밀로 충분 — 배터리 절약(useGeolocation 과 동일 정책) */
const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 0,
}

/**
 * 현재 GPS 좌표를 BE 에 주기적으로 보고한다 (PUT /customers/me/location).
 * → 알림 타겟 "현재 위치 3km" 의 데이터 소스.
 *
 * 게이트:
 *  - ROLE_CUSTOMER 로그인 상태일 때만 (useAuthStore.isAuthenticated)
 *  - 알림 설정 "주변 떨이(nearbyDeal)" ON 일 때만 — OFF 면 위치 자체를 보내지 않음(프라이버시·네트워크)
 *
 * 동작 (BE 계약: 포그라운드 진입 1회 + 유지 중 5분 주기):
 *  - 마운트(=런치 포그라운드) 즉시 1회 + 5분 인터벌 시작
 *  - hidden 동안 인터벌 정지, visible 복귀 시 즉시 1회 + 인터벌 재개
 *  - 실제 GPS 성공 시에만 PUT. 권한 거부/실패/미지원 → 조용히 skip(fallback 좌표 보내지 않음 —
 *    그래야 "현재 위치" 타겟이 "기본 주소지" 타겟과 중복·오염되지 않음)
 *  - PUT 실패(네트워크/4xx)는 무시하고 다음 주기 재시도
 */
export function useLocationReporter(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: settings } = useNotificationSettings()
  const enabled = isAuthenticated && settings?.nearbyDeal === true

  useEffect(() => {
    if (!enabled) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    if (typeof document === 'undefined') return

    let alive = true
    let intervalId: ReturnType<typeof setInterval> | undefined

    const reportOnce = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!alive) return
          // 실 GPS 성공 — fallback 좌표는 보내지 않는다
          void locationApi
            .updateMyLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            })
            .catch(() => {
              // 네트워크/4xx 실패 → 조용히 무시, 다음 주기 재시도
            })
        },
        () => {
          // 권한 거부/실패/미지원 → skip
        },
        GEO_OPTIONS,
      )
    }

    const startInterval = () => {
      if (intervalId != null) return
      intervalId = setInterval(reportOnce, REPORT_INTERVAL_MS)
    }
    const stopInterval = () => {
      if (intervalId == null) return
      clearInterval(intervalId)
      intervalId = undefined
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reportOnce()
        startInterval()
      } else {
        stopInterval()
      }
    }

    // 런치 = 포그라운드 — 즉시 1회 + 인터벌 시작
    reportOnce()
    startInterval()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      alive = false
      stopInterval()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [enabled])
}
