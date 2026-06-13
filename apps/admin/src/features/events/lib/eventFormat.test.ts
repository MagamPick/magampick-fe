import { describe, it, expect } from 'vitest'
import {
  formatWon,
  formatDiscount,
  formatIssue,
  formatPeriod,
  EVENT_STATUS_LABEL,
  toYMD,
  todayYMD,
  parseYMD,
} from './eventFormat'

describe('eventFormat', () => {
  describe('formatDiscount', () => {
    it('RATE 는 퍼센트로 표기', () => {
      expect(formatDiscount('RATE', 10)).toBe('10%')
    })
    it('AMOUNT 는 원화로 천단위 콤마 표기', () => {
      expect(formatDiscount('AMOUNT', 2000)).toBe('2,000원')
    })
  })

  describe('formatWon', () => {
    it('천단위 콤마 + 원', () => {
      expect(formatWon(10000)).toBe('10,000원')
      expect(formatWon(0)).toBe('0원')
    })
  })

  describe('formatIssue', () => {
    it('선착순(limit 숫자) 은 n / limit', () => {
      expect(formatIssue(5, 100)).toBe('5 / 100')
    })
    it('무제한(null) 은 ∞', () => {
      expect(formatIssue(5, null)).toBe('5 / ∞')
    })
    it('발급 수도 천단위 콤마', () => {
      expect(formatIssue(1200, 5000)).toBe('1,200 / 5,000')
    })
  })

  describe('formatPeriod', () => {
    it('시작 ~ 종료', () => {
      expect(formatPeriod('2026-06-20', '2026-07-20')).toBe('2026-06-20 ~ 2026-07-20')
    })
  })

  describe('EVENT_STATUS_LABEL', () => {
    it('상태별 한글 라벨', () => {
      expect(EVENT_STATUS_LABEL.scheduled).toBe('예정')
      expect(EVENT_STATUS_LABEL.ongoing).toBe('진행중')
      expect(EVENT_STATUS_LABEL.ended).toBe('종료')
    })
  })

  describe('날짜 유틸', () => {
    it('toYMD 는 로컬 yyyy-MM-dd (zero-pad)', () => {
      expect(toYMD(new Date(2026, 5, 20))).toBe('2026-06-20')
      expect(toYMD(new Date(2026, 0, 3))).toBe('2026-01-03')
    })
    it('todayYMD 는 주입한 Date 기준', () => {
      expect(todayYMD(new Date(2026, 5, 13))).toBe('2026-06-13')
    })
    it('parseYMD 는 로컬 자정 Date', () => {
      const d = parseYMD('2026-06-20')!
      expect(d.getFullYear()).toBe(2026)
      expect(d.getMonth()).toBe(5)
      expect(d.getDate()).toBe(20)
    })
    it('parseYMD 왕복(roundtrip)', () => {
      expect(toYMD(parseYMD('2026-12-31')!)).toBe('2026-12-31')
    })
    it('parseYMD 형식 불일치는 undefined', () => {
      expect(parseYMD('')).toBeUndefined()
      expect(parseYMD('2026/06/20')).toBeUndefined()
    })
  })
})
