import { describe, it, expect } from 'vitest'
import { buildPickupSlots } from './buildPickupSlots'

/** 로컬 시각 기준 nowMs (연·월은 무관 — 시/분만 사용) */
const at = (h: number, m: number) => new Date(2026, 5, 1, h, m, 0, 0).getTime()

describe('buildPickupSlots', () => {
  it('다음_15분_경계부터_마감_포함_15분_단위', () => {
    expect(buildPickupSlots('20:00', at(18, 0))).toEqual([
      '18:15',
      '18:30',
      '18:45',
      '19:00',
      '19:15',
      '19:30',
      '19:45',
      '20:00',
    ])
  })

  it('현재가_슬롯_사이면_다음_경계부터', () => {
    expect(buildPickupSlots('19:00', at(18, 5))).toEqual(['18:15', '18:30', '18:45', '19:00'])
  })

  it('정각이면_현재_시각은_제외하고_다음_경계부터', () => {
    // 18:15 정각 → 현재 슬롯은 ASAP 영역, 다음 경계(18:30)부터
    expect(buildPickupSlots('19:00', at(18, 15))).toEqual(['18:30', '18:45', '19:00'])
  })

  it('마감_임박이면_마감_슬롯만', () => {
    expect(buildPickupSlots('20:00', at(19, 50))).toEqual(['20:00'])
  })

  it('마감_도달_이후면_빈_배열', () => {
    expect(buildPickupSlots('20:00', at(20, 0))).toEqual([])
    expect(buildPickupSlots('20:00', at(20, 30))).toEqual([])
  })

  it('잘못된_마감시각은_빈_배열', () => {
    expect(buildPickupSlots('bad', at(18, 0))).toEqual([])
  })
})
