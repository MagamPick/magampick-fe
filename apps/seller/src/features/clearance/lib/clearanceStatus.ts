import type { ClearanceStatus } from '../types'

/** 정상가 대비 할인율(정수%). 정상가 0 이하면 0 (0 나눗셈 방지) */
export function discountRate(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round((1 - salePrice / originalPrice) * 100)
}

/** Date → "HH:MM" (로컬, zero-pad). 픽업 마감 비교용 */
export function nowHHMM(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * 픽업 마감 시각 도달/초과 여부 (오늘 같은 날 가정).
 * 실연동은 BE 스케줄러가 마감 — mock 은 읽기 시 이 판정으로 EXPIRED 반영.
 */
export function isExpired(closeTime: string, now: string = nowHHMM()): boolean {
  return now >= closeTime
}

/** 떨이 도메인 상태 → DealCard 표시 상태 (presentational live/ended) */
export function toDealCardStatus(status: ClearanceStatus): 'live' | 'ended' {
  return status === 'ACTIVE' ? 'live' : 'ended'
}
