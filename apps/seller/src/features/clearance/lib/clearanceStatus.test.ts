import { describe, it, expect } from 'vitest'
import { discountRate, nowHHMM, isExpired, toDealCardStatus } from './clearanceStatus'

describe('discountRate', () => {
  it('정상가 대비 할인율을 정수%로 계산한다', () => {
    expect(discountRate(4000, 2000)).toBe(50)
    expect(discountRate(5000, 2750)).toBe(45)
  })

  it('정상가가 0 이하이면 0을 반환한다 (0 나눗셈 방지)', () => {
    expect(discountRate(0, 0)).toBe(0)
  })
})

describe('nowHHMM', () => {
  it('Date를 zero-pad된 HH:MM 문자열로 변환한다', () => {
    expect(nowHHMM(new Date(2026, 0, 1, 9, 5))).toBe('09:05')
    expect(nowHHMM(new Date(2026, 0, 1, 21, 30))).toBe('21:30')
  })
})

describe('isExpired', () => {
  it('현재 시각이 마감 시각에 도달/초과하면 만료다', () => {
    expect(isExpired('21:00', '20:59')).toBe(false)
    expect(isExpired('21:00', '21:00')).toBe(true)
    expect(isExpired('21:00', '21:01')).toBe(true)
  })
})

describe('toDealCardStatus', () => {
  it('ACTIVE는 진행중(live), 그 외는 마감(ended)으로 매핑한다', () => {
    expect(toDealCardStatus('ACTIVE')).toBe('live')
    expect(toDealCardStatus('CLOSED')).toBe('ended')
    expect(toDealCardStatus('SOLD_OUT')).toBe('ended')
  })
})
