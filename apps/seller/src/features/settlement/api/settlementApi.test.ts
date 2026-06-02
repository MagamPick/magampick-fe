import { describe, it, expect, beforeEach } from 'vitest'
import { settlementApi, resetSettlementsForTest } from './settlementApi'
import { calcNet } from '../lib/settlementCalc'

describe('settlementApi (mock)', () => {
  beforeEach(() => resetSettlementsForTest())

  describe('listSettlementCycles', () => {
    it('s1 의 정산 회차를 최신순(periodStart desc)으로 반환한다', async () => {
      const list = await settlementApi.listSettlementCycles('s1')
      expect(list.length).toBe(5)
      expect(list.every((c) => c.storeId === 's1')).toBe(true)
      const starts = list.map((c) => new Date(c.periodStart).getTime())
      expect(starts).toEqual([...starts].sort((a, b) => b - a))
    })

    it('입금 예정일이 지난 회차는 입금완료, 아직 안 지난 회차는 정산예정이다', async () => {
      const list = await settlementApi.listSettlementCycles('s1')
      const now = Date.now()
      for (const c of list) {
        const expected = new Date(c.depositDate).getTime() <= now ? 'DEPOSITED' : 'SCHEDULED'
        expect(c.status).toBe(expected)
      }
    })

    it('정산액(net)·수수료(fee)는 결제액에서 산출한 real 값이다', async () => {
      const list = await settlementApi.listSettlementCycles('s1')
      for (const c of list) {
        expect(c.netAmount).toBe(calcNet(c.grossAmount))
        expect(c.feeAmount).toBe(c.grossAmount - c.netAmount)
      }
    })

    it('정산 데이터가 없는 매장은 빈 목록을 반환한다', async () => {
      expect(await settlementApi.listSettlementCycles('s2')).toEqual([])
    })
  })

  describe('getSettlementSummary', () => {
    it('이번 회차 요약 = 입금 대기(정산예정) 중 가장 최근 회차다', async () => {
      const list = await settlementApi.listSettlementCycles('s1')
      const summary = await settlementApi.getSettlementSummary('s1')
      const expected = list.find((c) => c.status === 'SCHEDULED') ?? list[0]
      expect(summary).not.toBeNull()
      expect(summary?.cycleId).toBe(expected.id)
      expect(summary?.netAmount).toBe(expected.netAmount)
      expect(summary?.periodLabel).toMatch(/\d+월 [12]차/)
    })

    it('정산 데이터가 없는 매장은 null 을 반환한다', async () => {
      expect(await settlementApi.getSettlementSummary('s2')).toBeNull()
    })
  })
})
