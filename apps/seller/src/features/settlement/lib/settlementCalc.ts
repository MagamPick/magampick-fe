import type { SettlementHalf } from '../types'

/**
 * 정산 표시용 순수 함수 — 회차 경계(cycleBoundaries), 날짜·기간 라벨(formatMonthDay, formatPeriod).
 * 금액 산출(calcFee, calcNet)·입금일 산출(depositDateOf)은 BE 가 계산해 반환하므로 제거됨.
 */

/** 해당 월(1~12)의 말일 — new Date(y, m, 0) = m월의 마지막 날(다음 달 0일). */
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** 반월 회차 경계 — 1차 1~15일 / 2차 16~말일 (로컬 자정 Date). */
export function cycleBoundaries(
  year: number,
  month: number,
  half: SettlementHalf,
): { start: Date; end: Date } {
  if (half === 1) {
    return { start: new Date(year, month - 1, 1), end: new Date(year, month - 1, 15) }
  }
  return {
    start: new Date(year, month - 1, 16),
    end: new Date(year, month - 1, lastDayOfMonth(year, month)),
  }
}

/** "M월 D일" */
export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

/** "5월 2차 · 5/16~5/31" — 회차 기간 라벨. */
export function formatPeriod(year: number, month: number, half: SettlementHalf): string {
  const { start, end } = cycleBoundaries(year, month, half)
  return `${month}월 ${half}차 · ${month}/${start.getDate()}~${month}/${end.getDate()}`
}
