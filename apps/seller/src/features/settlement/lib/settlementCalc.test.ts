import { describe, it, expect } from 'vitest'
import {
  calcFee,
  calcNet,
  lastDayOfMonth,
  cycleBoundaries,
  depositDateOf,
  formatMonthDay,
  formatPeriod,
} from './settlementCalc'
import { TOTAL_FEE_RATE } from '../types'

describe('settlementCalc — 정산 금액·회차 계산 (real)', () => {
  describe('수수료 / 정산액', () => {
    it('수수료율은 중개 5% + 결제 1.5% = 6.5% 다', () => {
      expect(TOTAL_FEE_RATE).toBeCloseTo(0.065, 10)
    })

    it('calcFee 는 결제액의 6.5% 를 원 단위로 반올림한다', () => {
      expect(calcFee(2_000_000)).toBe(130_000)
      expect(calcFee(1_234_567)).toBe(80_247) // 80246.855 → 반올림
    })

    it('calcNet 은 결제액 − 수수료 다', () => {
      expect(calcNet(2_000_000)).toBe(1_870_000)
      expect(calcNet(1_234_567)).toBe(1_234_567 - calcFee(1_234_567))
    })
  })

  describe('회차 경계 — 1차 1~15일 / 2차 16~말일', () => {
    it('lastDayOfMonth — 2월(평년 28)·6월(30)·2월 윤년(29)', () => {
      expect(lastDayOfMonth(2026, 2)).toBe(28)
      expect(lastDayOfMonth(2026, 6)).toBe(30)
      expect(lastDayOfMonth(2028, 2)).toBe(29)
    })

    it('1차는 1일~15일', () => {
      const { start, end } = cycleBoundaries(2026, 5, 1)
      expect(start.getMonth()).toBe(4) // 0-index = 5월
      expect(start.getDate()).toBe(1)
      expect(end.getDate()).toBe(15)
    })

    it('2차는 16일~말일', () => {
      const { start, end } = cycleBoundaries(2026, 5, 2)
      expect(start.getDate()).toBe(16)
      expect(end.getDate()).toBe(31) // 5월 말일
    })

    it('2월 2차는 28일까지(평년)', () => {
      expect(cycleBoundaries(2026, 2, 2).end.getDate()).toBe(28)
    })
  })

  describe('입금일 — 1차→당월 25일 / 2차→익월 10일', () => {
    it('1차는 당월 25일', () => {
      const d = depositDateOf(2026, 5, 1)
      expect(d.getMonth()).toBe(4) // 5월
      expect(d.getDate()).toBe(25)
    })

    it('2차는 익월 10일', () => {
      const d = depositDateOf(2026, 5, 2)
      expect(d.getMonth()).toBe(5) // 6월
      expect(d.getDate()).toBe(10)
    })

    it('12월 2차는 익년 1월 10일', () => {
      const d = depositDateOf(2026, 12, 2)
      expect(d.getFullYear()).toBe(2027)
      expect(d.getMonth()).toBe(0) // 1월
      expect(d.getDate()).toBe(10)
    })
  })

  describe('라벨 포맷', () => {
    it('formatMonthDay — "M월 D일"', () => {
      expect(formatMonthDay(new Date(2026, 5, 10))).toBe('6월 10일')
    })

    it('formatPeriod — "5월 2차 · 5/16~5/31"', () => {
      expect(formatPeriod(2026, 5, 2)).toBe('5월 2차 · 5/16~5/31')
      expect(formatPeriod(2026, 5, 1)).toBe('5월 1차 · 5/1~5/15')
    })
  })
})
