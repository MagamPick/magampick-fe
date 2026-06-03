import { useEffect, useState } from 'react'

export interface GeoPosition {
  latitude: number
  longitude: number
  /** gps = 실제 현재 위치 / fallback = 권한 거부·실패·미지원 시 기본 주소지 좌표 */
  source: 'gps' | 'fallback'
}

/**
 * 기본 주소지 fallback 좌표 — addressesApi 의 mock 현재 위치(서울 마포구 양화로)와 동일.
 * BE 연동 시 소비자 기본 주소지 API 좌표로 교체.
 */
const FALLBACK: GeoPosition = { latitude: 37.5571, longitude: 126.925, source: 'fallback' }

/**
 * 현재 위치(GPS) 좌표 훅. 권한 거부/실패/미지원 시 기본 주소지로 자동 fallback(알림 없이).
 * 노션: "GPS 권한 거부/실패 시 기본 주소지 좌표 fallback (사용자 알림 없이 자연 대체)".
 * 지도 탭(매장 마커 중심)·매장 위치 화면(내 위치 파란 점) 공용. position 이 확정되면 isReady=true.
 */
export function useGeolocation(): { position: GeoPosition; isReady: boolean } {
  // geolocation 미지원이면 처음부터 fallback(렌더 직후 동기 setState 회피). 지원이면 null → effect 가 채움.
  const [position, setPosition] = useState<GeoPosition | null>(() =>
    typeof navigator !== 'undefined' && navigator.geolocation ? null : FALLBACK,
  )

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    let alive = true
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (alive)
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            source: 'gps',
          })
      },
      () => {
        if (alive) setPosition(FALLBACK)
      },
      { timeout: 5000, enableHighAccuracy: false },
    )
    return () => {
      alive = false
    }
  }, [])

  return { position: position ?? FALLBACK, isReady: position !== null }
}
