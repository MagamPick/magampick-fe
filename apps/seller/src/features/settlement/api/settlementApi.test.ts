import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { settlementApi } from './settlementApi'

/** BE SettlementCycleResponse 단건 픽스처 */
const beCycle = {
  id: 1,
  storeId: 1,
  year: 2026,
  month: 6,
  half: 1,
  periodStart: '2026-06-01T00:00:00.000Z',
  periodEnd: '2026-06-15T00:00:00.000Z',
  depositDate: '2026-06-25T00:00:00.000Z',
  grossAmount: 3_000_000,
  feeAmount: 195_000,
  netAmount: 2_805_000,
  status: 'SCHEDULED',
}

/** BE SettlementSummaryResponse 픽스처 */
const beSummary = {
  cycleId: 1,
  periodLabel: '6월 1차 · 6/1~6/15',
  netAmount: 2_805_000,
  depositDate: '2026-06-25T00:00:00.000Z',
  status: 'SCHEDULED',
}

describe('settlementApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listSettlementCycles', () => {
    it('올바른 URL로 GET 요청하고 SettlementCycle[] 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beCycle] })

      const result = await settlementApi.listSettlementCycles('1')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/settlements')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',       // number → string
        storeId: '1',  // number → string
        year: 2026,
        month: 6,
        half: 1,
        grossAmount: 3_000_000,
        feeAmount: 195_000,
        netAmount: 2_805_000,
        status: 'SCHEDULED',
      })
    })

    it('periodStart·periodEnd·depositDate 를 그대로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beCycle] })

      const result = await settlementApi.listSettlementCycles('1')

      expect(result[0].periodStart).toBe('2026-06-01T00:00:00.000Z')
      expect(result[0].periodEnd).toBe('2026-06-15T00:00:00.000Z')
      expect(result[0].depositDate).toBe('2026-06-25T00:00:00.000Z')
    })

    it('정산 데이터가 없는 매장은 빈 목록을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

      const result = await settlementApi.listSettlementCycles('2')

      expect(result).toEqual([])
    })

    it('strict status: enum 밖 값이면 parse 에서 throw 한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beCycle, status: 'UNKNOWN' }],
      })

      await expect(settlementApi.listSettlementCycles('1')).rejects.toThrow()
    })
  })

  describe('getSettlementSummary', () => {
    it('올바른 URL로 GET 요청하고 SettlementSummary 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ status: 200, data: beSummary })

      const result = await settlementApi.getSettlementSummary('1')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/settlements/summary')
      expect(result).toMatchObject({
        cycleId: '1',  // number → string
        periodLabel: '6월 1차 · 6/1~6/15',
        netAmount: 2_805_000,
        depositDate: '2026-06-25T00:00:00.000Z',
        status: 'SCHEDULED',
      })
    })

    it('204 응답이면 null 을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ status: 204, data: null })

      const result = await settlementApi.getSettlementSummary('1')

      expect(result).toBeNull()
    })

    it('data 가 없으면(빈 응답) null 을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ status: 200, data: null })

      const result = await settlementApi.getSettlementSummary('1')

      expect(result).toBeNull()
    })

    it('strict status: enum 밖 값이면 parse 에서 throw 한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        status: 200,
        data: { ...beSummary, status: 'PENDING' },
      })

      await expect(settlementApi.getSettlementSummary('1')).rejects.toThrow()
    })
  })
})
