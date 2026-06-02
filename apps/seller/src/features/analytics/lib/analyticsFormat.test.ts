import { describe, it, expect } from 'vitest'
import {
  formatWon,
  formatWonSymbol,
  formatPercent,
  formatRating,
  formatUnit,
  formatDelta,
  barHeights,
  peakIndex,
  periodLabel,
  pickupRate,
  topTags,
} from './analyticsFormat'
import type { ReviewTagCount } from '../types'

describe('analyticsFormat — 통계 표시 포맷·파생 (순수)', () => {
  describe('금액·숫자 포맷', () => {
    it('formatWon — 천 단위 콤마 + "원" 접미', () => {
      expect(formatWon(9500)).toBe('9,500원')
      expect(formatWon(0)).toBe('0원')
    })

    it('formatWonSymbol — "₩" 접두 + 천 단위 콤마', () => {
      expect(formatWonSymbol(380_000)).toBe('₩380,000')
      expect(formatWonSymbol(8_920_000)).toBe('₩8,920,000')
    })

    it('formatPercent — 정수 % 접미', () => {
      expect(formatPercent(94)).toBe('94%')
      expect(formatPercent(0)).toBe('0%')
    })

    it('formatRating — 항상 소수 1자리', () => {
      expect(formatRating(4.8)).toBe('4.8')
      expect(formatRating(5)).toBe('5.0')
    })

    it('formatUnit — 콤마 + 단위 접미(건/개 등)', () => {
      expect(formatUnit(32, '건')).toBe('32건')
      expect(formatUnit(1200, '개')).toBe('1,200개')
    })
  })

  describe('formatDelta — 전기 대비 증감 (▲/▼ + tone)', () => {
    it('양수는 상승(▲, up)', () => {
      expect(formatDelta(8)).toEqual({ tone: 'up', arrow: '▲', text: '8%' })
    })
    it('음수는 하락(▼, down) — 절댓값 표시', () => {
      expect(formatDelta(-5)).toEqual({ tone: 'down', arrow: '▼', text: '5%' })
    })
    it('0은 변동없음(flat, 화살표 없음)', () => {
      expect(formatDelta(0)).toEqual({ tone: 'flat', arrow: '', text: '0%' })
    })
  })

  describe('barHeights — 최댓값을 100%로 정규화', () => {
    it('각 값을 max 대비 백분율(반올림)로 변환', () => {
      expect(barHeights([30, 72, 48])).toEqual([42, 100, 67])
    })
    it('모두 0이면 0 배열 (0 나눗셈 방지)', () => {
      expect(barHeights([0, 0, 0])).toEqual([0, 0, 0])
    })
    it('빈 배열은 빈 배열', () => {
      expect(barHeights([])).toEqual([])
    })
  })

  describe('peakIndex — 최고점 막대 인덱스', () => {
    it('최댓값의 인덱스 (동률이면 첫 번째)', () => {
      expect(peakIndex([30, 72, 48])).toBe(1)
      expect(peakIndex([88, 88])).toBe(0)
    })
    it('빈 배열은 -1', () => {
      expect(peakIndex([])).toBe(-1)
    })
  })

  describe('periodLabel — 기간 라벨', () => {
    it('각 기간을 한국어 라벨로', () => {
      expect(periodLabel('today')).toBe('오늘')
      expect(periodLabel('week')).toBe('이번 주')
      expect(periodLabel('month')).toBe('이번 달')
      expect(periodLabel('year')).toBe('올해')
    })
  })

  describe('pickupRate — 픽업 완료율(%)', () => {
    it('pickedUp / total 반올림 정수%', () => {
      expect(pickupRate(30, 32)).toBe(94) // 93.75 → 94
      expect(pickupRate(116, 124)).toBe(94)
    })
    it('총 주문 0이면 0 (0 나눗셈 방지)', () => {
      expect(pickupRate(0, 0)).toBe(0)
    })
  })

  describe('topTags — 카운트 desc 상위 N', () => {
    const tags: ReviewTagCount[] = [
      { tag: '맛있어요', count: 2 },
      { tag: '신선해요', count: 5 },
      { tag: '친절해요', count: 3 },
      { tag: '가성비', count: 0 },
    ]
    it('카운트 내림차순으로 상위 N개만, count 0은 제외', () => {
      expect(topTags(tags, 2)).toEqual([
        { tag: '신선해요', count: 5 },
        { tag: '친절해요', count: 3 },
      ])
    })
    it('N이 개수보다 크면 0 제외한 전부', () => {
      expect(topTags(tags, 10)).toEqual([
        { tag: '신선해요', count: 5 },
        { tag: '친절해요', count: 3 },
        { tag: '맛있어요', count: 2 },
      ])
    })
  })
})
