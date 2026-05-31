import { describe, it, expect, beforeEach } from 'vitest'
import { storeApi, resetStoreState } from './storeApi'
import { WEEKDAYS, WEEKDAY_ORDER } from '../types'

const today = WEEKDAYS[new Date().getDay()]

beforeEach(() => resetStoreState())

describe('storeApi.getStores — 보유 매장 목록', () => {
  it('보유 매장 2개(역삼점·강남점)를 반환', async () => {
    const stores = await storeApi.getStores()
    expect(stores.map((s) => s.id)).toEqual(['s1', 's2'])
  })
})

describe('storeApi.getStoreStatus — 매장 영업 상태', () => {
  it('역삼점(s1)은 OPEN · 영업 요일 · 마감시각 포함', async () => {
    const st = await storeApi.getStoreStatus('s1')
    expect(st.operationStatus).toBe('OPEN')
    expect(st.canOpenToday).toBe(true)
    expect(st.todayCloseTime).toBe('21:00')
  })
  it('강남점(s2)은 CLOSED_TODAY · 영업 요일 0개라 canOpenToday=false', async () => {
    const st = await storeApi.getStoreStatus('s2')
    expect(st.operationStatus).toBe('CLOSED_TODAY')
    expect(st.canOpenToday).toBe(false)
  })
})

describe('storeApi.transitionStatus — 상태 전환', () => {
  it('역삼점 OPEN → BREAK 전환 성공', async () => {
    const st = await storeApi.transitionStatus({ storeId: 's1', to: 'BREAK' })
    expect(st.operationStatus).toBe('BREAK')
  })
  it('역삼점 OPEN → 오늘 영업 종료 → 영업 시작 사이클 성공', async () => {
    await storeApi.transitionStatus({ storeId: 's1', to: 'CLOSED_TODAY' })
    const reopened = await storeApi.transitionStatus({ storeId: 's1', to: 'OPEN' })
    expect(reopened.operationStatus).toBe('OPEN')
  })
  it('강남점(영업 요일 0개) 영업 시작 시 STORE_CLOSED_TODAY 거부', async () => {
    await expect(
      storeApi.transitionStatus({ storeId: 's2', to: 'OPEN' }),
    ).rejects.toMatchObject({ code: 'STORE_CLOSED_TODAY' })
  })
  it('OPEN 에서 다시 OPEN 같은 금지 전이는 INVALID_STATE_TRANSITION', async () => {
    await expect(
      storeApi.transitionStatus({ storeId: 's1', to: 'OPEN' }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION' })
  })
  it('CLOSED_TODAY → BREAK 금지 전이 거부', async () => {
    await expect(
      storeApi.transitionStatus({ storeId: 's2', to: 'BREAK' }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION' })
  })
})

describe('storeApi.getBusinessHours — 요일별 영업시간 조회', () => {
  it('역삼점(s1)은 영업 요일 7개', async () => {
    expect((await storeApi.getBusinessHours('s1')).length).toBe(7)
  })
  it('강남점(s2)은 전휴무 → 빈 배열', async () => {
    expect(await storeApi.getBusinessHours('s2')).toEqual([])
  })
})

describe('storeApi.saveBusinessHours — 영업시간 저장', () => {
  it('시작 >= 종료면 BUSINESS_HOURS_INVALID_RANGE 거부', async () => {
    await expect(
      storeApi.saveBusinessHours({
        storeId: 's2',
        hours: [{ day: 'mon', openTime: '21:00', closeTime: '09:00' }],
      }),
    ).rejects.toMatchObject({ code: 'BUSINESS_HOURS_INVALID_RANGE' })
  })

  it('시작 == 종료도 거부', async () => {
    await expect(
      storeApi.saveBusinessHours({
        storeId: 's2',
        hours: [{ day: 'mon', openTime: '09:00', closeTime: '09:00' }],
      }),
    ).rejects.toMatchObject({ code: 'BUSINESS_HOURS_INVALID_RANGE' })
  })

  it('모든 요일 휴무(빈 배열) 저장 허용', async () => {
    const saved = await storeApi.saveBusinessHours({ storeId: 's2', hours: [] })
    expect(saved).toEqual([])
  })

  it('저장 즉시 반영 — getBusinessHours 가 새 값을 돌려준다', async () => {
    const saved = await storeApi.saveBusinessHours({
      storeId: 's2',
      hours: [{ day: 'mon', openTime: '10:00', closeTime: '18:00' }],
    })
    expect(await storeApi.getBusinessHours('s2')).toEqual(saved)
  })

  it('저장 후 영업 상태(status)의 canOpenToday·todayCloseTime 가 새 영업시간 기준으로 반영', async () => {
    await storeApi.saveBusinessHours({
      storeId: 's2',
      hours: WEEKDAY_ORDER.map((day) => ({ day, openTime: '08:00', closeTime: '20:00' })),
    })
    const st = await storeApi.getStoreStatus('s2')
    expect(st.canOpenToday).toBe(true)
    expect(st.todayCloseTime).toBe('20:00')
  })

  it('영업중(OPEN) + 오늘 요일 시간 수정 포함 저장 → TODAY_BUSINESS_HOURS_LOCKED 거부', async () => {
    const current = await storeApi.getBusinessHours('s1')
    const next = current.map((h) => (h.day === today ? { ...h, closeTime: '23:00' } : h))
    await expect(
      storeApi.saveBusinessHours({ storeId: 's1', hours: next }),
    ).rejects.toMatchObject({ code: 'TODAY_BUSINESS_HOURS_LOCKED' })
  })

  it('영업중(OPEN) + 오늘 요일 삭제(휴무 전환) 저장 → TODAY_BUSINESS_HOURS_LOCKED 거부', async () => {
    const current = await storeApi.getBusinessHours('s1')
    const next = current.filter((h) => h.day !== today)
    await expect(
      storeApi.saveBusinessHours({ storeId: 's1', hours: next }),
    ).rejects.toMatchObject({ code: 'TODAY_BUSINESS_HOURS_LOCKED' })
  })

  it('영업중(OPEN) + 다른 요일만 변경은 허용', async () => {
    const current = await storeApi.getBusinessHours('s1')
    const otherDay = WEEKDAY_ORDER.find((d) => d !== today)!
    const next = current.map((h) => (h.day === otherDay ? { ...h, closeTime: '20:00' } : h))
    const saved = await storeApi.saveBusinessHours({ storeId: 's1', hours: next })
    expect(saved.find((h) => h.day === otherDay)?.closeTime).toBe('20:00')
    expect(saved.find((h) => h.day === today)?.closeTime).toBe('21:00')
  })
})
