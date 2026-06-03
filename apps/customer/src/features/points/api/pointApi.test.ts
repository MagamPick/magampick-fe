import { describe, it, expect } from 'vitest'
import { pointApi } from './pointApi'
import { pointDirection } from '../types'

// 모듈 상태 공유 → before/after 델타로 검증(절대값·실행순서 의존 최소화).
describe('pointApi', () => {
  it('getSummary — 잔액(0 이상 숫자) 반환', async () => {
    const s = await pointApi.getSummary()
    expect(typeof s.balance).toBe('number')
    expect(s.balance).toBeGreaterThanOrEqual(0)
  })

  it('listHistory(all) — 최신순 정렬', async () => {
    const list = await pointApi.listHistory('all')
    expect(list.length).toBeGreaterThan(0)
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].date >= list[i].date).toBe(true)
    }
  })

  it('listHistory(earn) — 적립 방향만', async () => {
    const list = await pointApi.listHistory('earn')
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((t) => pointDirection(t.reason) === 'earn')).toBe(true)
  })

  it('listHistory(use) — 사용 방향만', async () => {
    const list = await pointApi.listHistory('use')
    expect(list.every((t) => pointDirection(t.reason) === 'use')).toBe(true)
  })

  it('use — 잔액 차감 + 결제 사용 내역 추가', async () => {
    const before = (await pointApi.getSummary()).balance
    const beforeUse = (await pointApi.listHistory('use')).length
    const after = await pointApi.use(100, '테스트 매장')
    expect(after.balance).toBe(before - 100)
    const useList = await pointApi.listHistory('use')
    expect(useList.length).toBe(beforeUse + 1)
    expect(useList[0].reason).toBe('use')
    expect(useList[0].amount).toBe(100)
  })

  it('use — 잔액 초과 시 거부', async () => {
    const current = (await pointApi.getSummary()).balance
    await expect(pointApi.use(current + 1)).rejects.toThrow()
  })
})
