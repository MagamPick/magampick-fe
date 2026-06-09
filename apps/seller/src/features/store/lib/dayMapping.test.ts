import { describe, it, expect } from 'vitest'
import { WEEKDAY_TO_BE, BE_TO_WEEKDAY } from './dayMapping'
import { WEEKDAY_ORDER } from '../types'

describe('WEEKDAY_TO_BE — FE 요일(mon..sun) → BE 요일(MONDAY..SUNDAY)', () => {
  it('mon → MONDAY', () => expect(WEEKDAY_TO_BE.mon).toBe('MONDAY'))
  it('tue → TUESDAY', () => expect(WEEKDAY_TO_BE.tue).toBe('TUESDAY'))
  it('wed → WEDNESDAY', () => expect(WEEKDAY_TO_BE.wed).toBe('WEDNESDAY'))
  it('thu → THURSDAY', () => expect(WEEKDAY_TO_BE.thu).toBe('THURSDAY'))
  it('fri → FRIDAY', () => expect(WEEKDAY_TO_BE.fri).toBe('FRIDAY'))
  it('sat → SATURDAY', () => expect(WEEKDAY_TO_BE.sat).toBe('SATURDAY'))
  it('sun → SUNDAY', () => expect(WEEKDAY_TO_BE.sun).toBe('SUNDAY'))

  it('WEEKDAY_ORDER 7개 모두 커버 (누락 없음)', () => {
    WEEKDAY_ORDER.forEach((day) => {
      expect(WEEKDAY_TO_BE[day]).toBeTruthy()
    })
  })
})

describe('BE_TO_WEEKDAY — BE 요일(MONDAY..SUNDAY) → FE 요일(mon..sun)', () => {
  it('MONDAY → mon', () => expect(BE_TO_WEEKDAY.MONDAY).toBe('mon'))
  it('TUESDAY → tue', () => expect(BE_TO_WEEKDAY.TUESDAY).toBe('tue'))
  it('WEDNESDAY → wed', () => expect(BE_TO_WEEKDAY.WEDNESDAY).toBe('wed'))
  it('THURSDAY → thu', () => expect(BE_TO_WEEKDAY.THURSDAY).toBe('thu'))
  it('FRIDAY → fri', () => expect(BE_TO_WEEKDAY.FRIDAY).toBe('fri'))
  it('SATURDAY → sat', () => expect(BE_TO_WEEKDAY.SATURDAY).toBe('sat'))
  it('SUNDAY → sun', () => expect(BE_TO_WEEKDAY.SUNDAY).toBe('sun'))
})

describe('왕복 변환 일관성 (FE→BE→FE)', () => {
  it('WEEKDAY_ORDER 모든 요일이 왕복 변환 후 원복된다', () => {
    WEEKDAY_ORDER.forEach((day) => {
      const beDay = WEEKDAY_TO_BE[day]
      const backToFe = BE_TO_WEEKDAY[beDay]
      expect(backToFe).toBe(day)
    })
  })
})
