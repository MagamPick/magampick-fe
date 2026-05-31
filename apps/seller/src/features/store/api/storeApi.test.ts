import { describe, it, expect, beforeEach } from 'vitest'
import { storeApi, resetStoreState } from './storeApi'

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
