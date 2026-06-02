import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

const NOW = new Date('2026-06-02T12:00:00Z').getTime()
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const ago = (ms: number) => new Date(NOW - ms).toISOString()

describe('formatRelativeTime', () => {
  it('1분 미만은 방금 전', () => {
    expect(formatRelativeTime(ago(30 * 1000), NOW)).toBe('방금 전')
  })

  it('분 단위 표시', () => {
    expect(formatRelativeTime(ago(5 * MIN), NOW)).toBe('5분 전')
    expect(formatRelativeTime(ago(59 * MIN), NOW)).toBe('59분 전')
  })

  it('시간 단위 표시', () => {
    expect(formatRelativeTime(ago(3 * HOUR), NOW)).toBe('3시간 전')
    expect(formatRelativeTime(ago(23 * HOUR), NOW)).toBe('23시간 전')
  })

  it('하루 전은 어제', () => {
    expect(formatRelativeTime(ago(DAY), NOW)).toBe('어제')
  })

  it('2~6일 전은 N일 전', () => {
    expect(formatRelativeTime(ago(3 * DAY), NOW)).toBe('3일 전')
  })

  it('7일 이상은 날짜(M월 D일)로 표시', () => {
    // 정확한 날짜는 타임존 의존이라 형식만 검증
    expect(formatRelativeTime(ago(10 * DAY), NOW)).toMatch(/^\d{1,2}월 \d{1,2}일$/)
  })

  it('미래 시각은 방금 전으로 안전 처리', () => {
    expect(formatRelativeTime(ago(-5 * MIN), NOW)).toBe('방금 전')
  })
})
