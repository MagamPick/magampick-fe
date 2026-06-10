import { formatDistance } from '@/shared/lib/formatDistance'

/**
 * 직선거리 기반 도보 시간 추정 — 직선거리(km) × 15분/km.
 * 외부 길찾기 API 호출 없이 '매장 위치' 화면 하단 카드에 표기 (노션 결정).
 */
export function estimateWalkMinutes(distanceKm: number): number {
  return Math.max(1, Math.round(distanceKm * 15))
}

/** "도보 N분 · 0.3km" 형태 라벨 (거리는 formatDistance 로 소수 1자리 통일) */
export function walkAndDistanceLabel(distanceKm: number): string {
  return `도보 ${estimateWalkMinutes(distanceKm)}분 · ${formatDistance(distanceKm)}`
}
