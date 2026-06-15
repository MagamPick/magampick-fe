import { describe, it, expect } from 'vitest'
import {
  lastDayOfMonth,
  cycleBoundaries,
  formatMonthDay,
  formatPeriod,
} from './settlementCalc'

describe('settlementCalc — 회차 경계·표시 라벨', () => {
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
