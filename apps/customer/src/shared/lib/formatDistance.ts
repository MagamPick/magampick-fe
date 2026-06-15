/**
 * 매장 거리 표기 — BE 가 주는 km float 를 소수 1자리 km 로 통일.
 * 정확히 0 이면 소수점 없이 "0km". (소비자 탐색·매장 목록 표시 정책)
 * 단골/전체/검색/지도/매장상세 등 거리 노출 지점에서 공통 사용.
 */
export function formatDistance(km: number): string {
  if (km <= 0) return '0km'
  return `${km.toFixed(1)}km`
}
