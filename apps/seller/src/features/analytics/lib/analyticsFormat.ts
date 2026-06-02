import { ANALYTICS_PERIODS } from '../types'
import type { AnalyticsPeriod, ReviewTagCount } from '../types'

/**
 * 통계 표시 포맷·파생 — 순수 함수 모음 (노션 「사장 통계 대시보드」).
 * mock/컴포넌트는 raw 숫자를 들고, 여기서 원/%/증감/막대 높이 등 표시값을 만든다.
 */

/** "9,500원" — 천 단위 콤마 + 원 접미 (stat-list 값용) */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

/** "₩380,000" — ₩ 접두 (매출 히어로용) */
export function formatWonSymbol(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`
}

/** "94%" — 정수 % 접미 */
export function formatPercent(pct: number): string {
  return `${pct}%`
}

/** "4.8" — 항상 소수 1자리 (평균 별점) */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/** "32건" / "1,200개" — 콤마 + 단위 접미 */
export function formatUnit(value: number, unit: string): string {
  return `${value.toLocaleString('ko-KR')}${unit}`
}

/** 증감 표시 톤 — 상승/하락/변동없음 */
export type DeltaTone = 'up' | 'down' | 'flat'

/**
 * 전기 대비 증감 — 양수=상승(▲), 음수=하락(▼), 0=변동없음(화살표 없음).
 * text 는 절댓값 % (방향은 arrow/tone 으로 표현).
 */
export function formatDelta(pct: number): { tone: DeltaTone; arrow: string; text: string } {
  const tone: DeltaTone = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat'
  const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : ''
  return { tone, arrow, text: `${Math.abs(pct)}%` }
}

/** 막대 높이(%) — 최댓값을 100 으로 정규화(반올림). 모두 0/빈 배열은 0 처리. */
export function barHeights(values: number[]): number[] {
  const max = Math.max(0, ...values)
  if (max === 0) return values.map(() => 0)
  return values.map((v) => Math.round((v / max) * 100))
}

/** 최고점 막대 인덱스(동률이면 첫 번째). 빈 배열은 -1. */
export function peakIndex(values: number[]): number {
  if (values.length === 0) return -1
  let idx = 0
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[idx]) idx = i
  }
  return idx
}

/** 기간 한국어 라벨 (ANALYTICS_PERIODS 단일 출처) */
export function periodLabel(period: AnalyticsPeriod): string {
  return ANALYTICS_PERIODS.find((p) => p.value === period)?.label ?? ''
}

/** 픽업 완료율(%) = pickedUp / total 반올림. 총 0이면 0(0 나눗셈 방지). */
export function pickupRate(pickedUp: number, total: number): number {
  if (total === 0) return 0
  return Math.round((pickedUp / total) * 100)
}

/** 빠른평가 태그 — 카운트 desc 정렬 후 0 제외, 상위 limit 개. */
export function topTags(tags: ReviewTagCount[], limit: number): ReviewTagCount[] {
  return tags
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
