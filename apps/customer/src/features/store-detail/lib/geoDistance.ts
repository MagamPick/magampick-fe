/**
 * 두 좌표 사이 직선거리(km) — Haversine 공식.
 * '매장 위치' 화면에서 내 위치(GPS)와 매장 좌표 사이 거리를 산출해
 * 하단 카드 거리/도보 표기를 지도 점선(내 위치↔매장)과 같은 기준점으로 통일한다.
 * (BE distanceKm 는 기본 주소지 기준이라 GPS≠주소지면 점선과 불일치.)
 */
const EARTH_RADIUS_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}
