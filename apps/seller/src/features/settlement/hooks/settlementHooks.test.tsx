import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useSettlementCycles } from './useSettlementCycles'
import { useSettlementSummary } from './useSettlementSummary'
import { settlementApi } from '../api/settlementApi'
import type { SettlementCycle, SettlementSummary } from '../types'

vi.mock('../api/settlementApi')

const cycle = (o: Partial<SettlementCycle> = {}): SettlementCycle => ({
  id: 'st_2026_6_1',
  storeId: 's1',
  year: 2026,
  month: 6,
  half: 1,
  periodStart: '2026-06-01T00:00:00.000Z',
  periodEnd: '2026-06-15T00:00:00.000Z',
  depositDate: '2026-06-25T00:00:00.000Z',
  grossAmount: 1_000_000,
  feeAmount: 65_000,
  netAmount: 935_000,
  status: 'SCHEDULED',
  ...o,
})

describe('settlement hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useSettlementCycles 는 매장 회차 목록을 조회한다', async () => {
    vi.mocked(settlementApi.listSettlementCycles).mockResolvedValue([cycle()])
    const { result } = renderHook(() => useSettlementCycles('s1'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(settlementApi.listSettlementCycles).toHaveBeenCalledWith('s1')
    expect(result.current.data).toHaveLength(1)
  })

  it('useSettlementSummary 는 이번 회차 요약을 조회한다', async () => {
    const summary: SettlementSummary = {
      cycleId: 'st_2026_6_1',
      periodLabel: '6월 1차 · 6/1~6/15',
      netAmount: 935_000,
      depositDate: '2026-06-25T00:00:00.000Z',
      status: 'SCHEDULED',
    }
    vi.mocked(settlementApi.getSettlementSummary).mockResolvedValue(summary)
    const { result } = renderHook(() => useSettlementSummary('s1'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(settlementApi.getSettlementSummary).toHaveBeenCalledWith('s1')
    expect(result.current.data?.netAmount).toBe(935_000)
  })
})
