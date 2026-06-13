import type { CouponDiscountType, EventStatus } from '../types'

/** 원화 표기 "10,000원" */
export function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

/** 할인 표기 — RATE→"10%" / AMOUNT→"2,000원" */
export function formatDiscount(type: CouponDiscountType, value: number): string {
  return type === 'RATE' ? `${value}%` : formatWon(value)
}

/** 발급 표기 "{issued} / {limit}" — 무제한(null)은 ∞ */
export function formatIssue(issuedCount: number, issueLimit: number | null): string {
  const limit = issueLimit === null ? '∞' : issueLimit.toLocaleString('ko-KR')
  return `${issuedCount.toLocaleString('ko-KR')} / ${limit}`
}

/** 노출 기간 "2026-06-20 ~ 2026-07-20" */
export function formatPeriod(start: string, end: string): string {
  return `${start} ~ ${end}`
}

/** 상태 한글 라벨 */
export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  scheduled: '예정',
  ongoing: '진행중',
  ended: '종료',
}

// ─── 날짜 유틸 (clearance todayISODate 패턴 미러) ────────────────────────────

/** Date → 로컬 "yyyy-MM-dd" */
export function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 오늘 로컬 "yyyy-MM-dd" */
export function todayYMD(now: Date = new Date()): string {
  return toYMD(now)
}

/** "yyyy-MM-dd" → 로컬 자정 Date. 형식이 아니면 undefined */
export function parseYMD(s: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return undefined
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}
