import { TOTAL_FEE_RATE } from '../types'
import type { SettlementHalf } from '../types'

/**
 * 정산 금액·회차 계산 — 노션 「정산 처리」의 real 계산 코어 (송금만 stub, 계산은 real).
 * 순수 함수 모음: 수수료/정산액 + 반월 회차 경계 + 입금일 + 표시 라벨.
 */

/** 수수료 = 결제액 × 6.5% (원 단위 반올림). */
export function calcFee(gross: number): number {
  return Math.round(gross * TOTAL_FEE_RATE)
}

/** 정산액 = 결제액 − 수수료. */
export function calcNet(gross: number): number {
  return gross - calcFee(gross)
}

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

/** 입금(예정)일 — 1차 → 당월 25일 / 2차 → 익월 10일 (12월 2차는 익년 1월). */
export function depositDateOf(year: number, month: number, half: SettlementHalf): Date {
  if (half === 1) return new Date(year, month - 1, 25)
  return new Date(year, month, 10) // month(1~12) 를 0-index 로 넘기면 익월
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
