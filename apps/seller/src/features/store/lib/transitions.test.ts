import { describe, it, expect } from 'vitest'
import {
  getStatusLabel,
  getAvailableActions,
  canTransition,
} from './transitions'

describe('getStatusLabel — 영업 상태 라벨', () => {
  it('OPEN 은 마감 시각을 함께 보여준다', () => {
    expect(getStatusLabel('OPEN', '21:00')).toBe('영업중 · 21:00 마감')
  })
  it('OPEN 인데 마감 시각이 없으면 영업중만', () => {
    expect(getStatusLabel('OPEN')).toBe('영업중')
  })
  it('BREAK 은 잠시 휴식중', () => {
    expect(getStatusLabel('BREAK')).toBe('잠시 휴식중')
  })
  it('CLOSED_TODAY 는 오늘 영업 종료', () => {
    expect(getStatusLabel('CLOSED_TODAY')).toBe('오늘 영업 종료')
  })
})

describe('getAvailableActions — 상태별 노출 액션', () => {
  it('CLOSED_TODAY 는 영업 시작만 노출', () => {
    const actions = getAvailableActions('CLOSED_TODAY', true)
    expect(actions.map((a) => a.to)).toEqual(['OPEN'])
    expect(actions[0].label).toBe('영업 시작')
    expect(actions[0].enabled).toBe(true)
  })
  it('OPEN 은 잠시 휴식·오늘 영업 종료 노출', () => {
    const actions = getAvailableActions('OPEN', true)
    expect(actions.map((a) => a.to)).toEqual(['BREAK', 'CLOSED_TODAY'])
  })
  it('BREAK 은 영업 재개·오늘 영업 종료 노출', () => {
    const actions = getAvailableActions('BREAK', true)
    expect(actions.map((a) => a.to)).toEqual(['OPEN', 'CLOSED_TODAY'])
    expect(actions[0].label).toBe('영업 재개')
  })
  it('휴무일이면 영업 시작 액션이 비활성 + 사유 포함', () => {
    const actions = getAvailableActions('CLOSED_TODAY', false)
    expect(actions[0].enabled).toBe(false)
    expect(actions[0].disabledReason).toBeTruthy()
  })
  it('휴무일이면 BREAK 의 영업 재개도 비활성, 오늘 영업 종료는 활성', () => {
    const actions = getAvailableActions('BREAK', false)
    const resume = actions.find((a) => a.to === 'OPEN')!
    const close = actions.find((a) => a.to === 'CLOSED_TODAY')!
    expect(resume.enabled).toBe(false)
    expect(close.enabled).toBe(true)
  })
})

describe('canTransition — 전환 가능 검증', () => {
  it('CLOSED_TODAY → OPEN 은 영업 요일일 때만 허용', () => {
    expect(canTransition('CLOSED_TODAY', 'OPEN', true)).toBe(true)
    expect(canTransition('CLOSED_TODAY', 'OPEN', false)).toBe(false)
  })
  it('OPEN → BREAK / CLOSED_TODAY 허용', () => {
    expect(canTransition('OPEN', 'BREAK', true)).toBe(true)
    expect(canTransition('OPEN', 'CLOSED_TODAY', true)).toBe(true)
  })
  it('BREAK → OPEN 은 영업 요일일 때만, BREAK → CLOSED_TODAY 허용', () => {
    expect(canTransition('BREAK', 'OPEN', true)).toBe(true)
    expect(canTransition('BREAK', 'OPEN', false)).toBe(false)
    expect(canTransition('BREAK', 'CLOSED_TODAY', true)).toBe(true)
  })
  it('CLOSED_TODAY → BREAK 는 금지 (영업 안 한 상태에서 휴식 X)', () => {
    expect(canTransition('CLOSED_TODAY', 'BREAK', true)).toBe(false)
  })
  it('자기 자신 전이는 금지', () => {
    expect(canTransition('OPEN', 'OPEN', true)).toBe(false)
    expect(canTransition('BREAK', 'BREAK', true)).toBe(false)
    expect(canTransition('CLOSED_TODAY', 'CLOSED_TODAY', true)).toBe(false)
  })
})
