import { describe, it, expect } from 'vitest'
import {
  toFormDays,
  toBusinessHours,
  formatRange,
  isTodayLocked,
  hasTodayHoursChanged,
  summarizeWeek,
  splitTime,
  joinTime,
  dayHoursError,
} from './businessHours'
import type { BusinessHour } from '../types'

const HOURS: BusinessHour[] = [
  { day: 'mon', openTime: '09:00', closeTime: '21:00' },
  { day: 'sat', openTime: '10:00', closeTime: '22:00' },
]

describe('toFormDays — 영업일 행 → 7요일 폼 행', () => {
  it('월~일 7행을 월요일 선두 순서로 만든다', () => {
    const days = toFormDays(HOURS)
    expect(days.map((d) => d.day)).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
  })

  it('영업일은 closed=false + 시각, 휴무일은 closed=true', () => {
    const days = toFormDays(HOURS)
    const mon = days.find((d) => d.day === 'mon')!
    const tue = days.find((d) => d.day === 'tue')!
    expect(mon).toMatchObject({ closed: false, openTime: '09:00', closeTime: '21:00' })
    expect(tue.closed).toBe(true)
  })

  it('휴무일도 토글 대비 기본 시각을 채운다', () => {
    const tue = toFormDays(HOURS).find((d) => d.day === 'tue')!
    expect(tue.openTime).toMatch(/^\d{2}:\d{2}$/)
    expect(tue.closeTime).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('toBusinessHours — 폼 행 → 영업일만', () => {
  it('closed 행은 빼고 영업일만 BusinessHour 로 모은다', () => {
    const hours = toBusinessHours(toFormDays(HOURS))
    expect(hours).toEqual([
      { day: 'mon', openTime: '09:00', closeTime: '21:00' },
      { day: 'sat', openTime: '10:00', closeTime: '22:00' },
    ])
  })

  it('모든 행이 휴무면 빈 배열', () => {
    const allClosed = toFormDays([])
    expect(toBusinessHours(allClosed)).toEqual([])
  })
})

describe('formatRange — 시간 범위 표기', () => {
  it('"09:00 – 21:00" 형식', () => {
    expect(formatRange('09:00', '21:00')).toBe('09:00 – 21:00')
  })
})

describe('isTodayLocked — 영업중 오늘 행 잠금', () => {
  it('OPEN + 오늘 요일 + 오늘이 영업일이면 잠금', () => {
    expect(isTodayLocked('mon', 'mon', 'OPEN', true)).toBe(true)
  })
  it('다른 요일은 잠금 아님', () => {
    expect(isTodayLocked('tue', 'mon', 'OPEN', true)).toBe(false)
  })
  it('OPEN 이라도 오늘이 휴무(행 없음)면 잠금 아님 — 신규 추가 허용', () => {
    expect(isTodayLocked('mon', 'mon', 'OPEN', false)).toBe(false)
  })
  it('BREAK / CLOSED_TODAY 면 잠금 아님', () => {
    expect(isTodayLocked('mon', 'mon', 'BREAK', true)).toBe(false)
    expect(isTodayLocked('mon', 'mon', 'CLOSED_TODAY', true)).toBe(false)
  })
})

describe('hasTodayHoursChanged — 오늘 행 변경 감지(잠금 검증용)', () => {
  const prev: BusinessHour[] = [
    { day: 'mon', openTime: '09:00', closeTime: '21:00' },
    { day: 'tue', openTime: '09:00', closeTime: '21:00' },
  ]

  it('오늘 시각 수정 → 변경', () => {
    const next = [{ day: 'mon', openTime: '09:00', closeTime: '22:00' } as BusinessHour, prev[1]]
    expect(hasTodayHoursChanged(prev, next, 'mon')).toBe(true)
  })
  it('오늘 행 삭제(휴무 전환) → 변경', () => {
    const next = [prev[1]]
    expect(hasTodayHoursChanged(prev, next, 'mon')).toBe(true)
  })
  it('오늘 신규 추가(이전 휴무) → 변경 아님(허용)', () => {
    const next = [...prev, { day: 'wed', openTime: '09:00', closeTime: '21:00' } as BusinessHour]
    expect(hasTodayHoursChanged(prev, next, 'wed')).toBe(false)
  })
  it('다른 요일만 변경 → 변경 아님', () => {
    const next = [prev[0], { day: 'tue', openTime: '10:00', closeTime: '20:00' } as BusinessHour]
    expect(hasTodayHoursChanged(prev, next, 'mon')).toBe(false)
  })
  it('변화 없음 → 변경 아님', () => {
    expect(hasTodayHoursChanged(prev, prev, 'mon')).toBe(false)
  })
})

describe('summarizeWeek — 읽기전용 주간 요약', () => {
  it('7행, 영업일은 시간 텍스트 / 휴무일은 "휴무"', () => {
    const rows = summarizeWeek(HOURS)
    expect(rows).toHaveLength(7)
    expect(rows.find((r) => r.day === 'mon')).toMatchObject({
      label: '월요일',
      text: '09:00 – 21:00',
      closed: false,
    })
    expect(rows.find((r) => r.day === 'tue')).toMatchObject({ text: '휴무', closed: true })
  })
})

describe('splitTime / joinTime — HH:MM 분해·결합', () => {
  it('분해', () => {
    expect(splitTime('09:30')).toEqual({ hour: '09', minute: '30' })
  })
  it('결합', () => {
    expect(joinTime('09', '30')).toBe('09:30')
  })
})

describe('dayHoursError — 편집 검증 메시지', () => {
  it('휴무면 null', () => {
    expect(dayHoursError({ closed: true, openTime: '', closeTime: '' })).toBeNull()
  })
  it('유효 범위면 null', () => {
    expect(dayHoursError({ closed: false, openTime: '09:00', closeTime: '21:00' })).toBeNull()
  })
  it('시작 >= 종료면 "이후" 안내', () => {
    expect(dayHoursError({ closed: false, openTime: '21:00', closeTime: '09:00' })).toMatch(/이후/)
    expect(dayHoursError({ closed: false, openTime: '09:00', closeTime: '09:00' })).toMatch(/이후/)
  })
})
