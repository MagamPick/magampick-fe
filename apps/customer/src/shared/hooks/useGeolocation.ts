import { useEffect, useState } from 'react'

export interface GeoPosition {
  latitude: number
  longitude: number
  /** gps = 실제 현재 위치 / fallback = 권한 거부·실패·미지원 시 기본 주소지 좌표 */
  source: 'gps' | 'fallback'
}

/**
 * GPS 미지원/실패 시 최후 수단 하드코딩 좌표 (서울 마포구 양화로).
 * 실 기본 주소지 fallback 파라미터가 없을 때만 사용.
 */
const HARDCODED_FALLBACK: GeoPosition = {
  latitude: 37.5571,
  longitude: 126.925,
  source: 'fallback',
}

/**
 * 현재 위치(GPS) 좌표 훅. 권한 거부/실패/미지원 시 기본 주소지로 자동 fallback(알림 없이).
 * 노션: "GPS 권한 거부/실패 시 기본 주소지 좌표 fallback (사용자 알림 없이 자연 대체)".
 * 지도 탭(매장 마커 중심)·매장 위치 화면(내 위치 파란 점) 공용.
 *
 * @param fallback 기본 주소지 좌표 (useAddresses 에서 isDefault===true 항목의 latitude/longitude).
 *   제공 시 GPS 실패/거부 → 이 좌표로 fallback. null/undefined 면 HARDCODED_FALLBACK 사용.
 *   반응형: 주소가 늦게 로드돼도 position 이 즉시 갱신된다.
 *
 * position 파생 우선순위: GPS 좌표 > fallback 파라미터 > HARDCODED_FALLBACK.
 * isReady: GPS 결정(성공/실패) 났을 때 true — 그 사이 fallback/하드코딩으로 먼저 렌더 가능.
 */
export function useGeolocation(
  fallback?: { latitude: number; longitude: number } | null,
): { position: GeoPosition; isReady: boolean } {
  // GPS 성공 시 채워지는 좌표 (null = GPS 미결 또는 실패)
  const [gpsCoord, setGpsCoord] = useState<{ latitude: number; longitude: number } | null>(null)
  // GPS 결정 여부 (성공 or 실패 어느 쪽이든 결론 났을 때 true)
  const [gpsReady, setGpsReady] = useState<boolean>(() => {
    // 지오로케이션 미지원이면 처음부터 결정 완료(fallback 으로 동작)
    return typeof navigator === 'undefined' || !navigator.geolocation
  })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    let alive = true
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!alive) return
        setGpsCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setGpsReady(true)
      },
      () => {
        if (!alive) return
        // GPS 실패 — gpsCoord 는 null 유지, fallback/HARDCODED 로 position 파생
        setGpsReady(true)
      },
      { timeout: 5000, enableHighAccuracy: false },
    )
    return () => {
      alive = false
    }
  }, [])

  // 반응형 position: GPS > fallback 파라미터 > HARDCODED
  const position: GeoPosition = gpsCoord
    ? { ...gpsCoord, source: 'gps' }
    : fallback != null
      ? { latitude: fallback.latitude, longitude: fallback.longitude, source: 'fallback' }
      : HARDCODED_FALLBACK

  return { position, isReady: gpsReady }
}
