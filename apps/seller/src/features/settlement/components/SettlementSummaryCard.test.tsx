import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettlementSummaryCard } from './SettlementSummaryCard'
import { useSettlementSummary } from '../hooks/useSettlementSummary'
import type { SettlementSummary } from '../types'

vi.mock('../hooks/useSettlementSummary')

type QueryResult = ReturnType<typeof useSettlementSummary>

const summary: SettlementSummary = {
  cycleId: 'st_2026_6_1',
  periodLabel: '6월 1차 · 6/1~6/15',
  netAmount: 2_805_000,
  depositDate: new Date(2026, 5, 10).toISOString(), // 6월 10일
  status: 'SCHEDULED',
}

describe('SettlementSummaryCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('이번 회차 정산 예정 금액과 입금 예정일을 표시한다', () => {
    vi.mocked(useSettlementSummary).mockReturnValue({
      data: summary,
      isPending: false,
    } as QueryResult)
    render(<SettlementSummaryCard />)
    expect(screen.getByText('이번 회차 정산 예정 금액')).toBeInTheDocument()
    expect(screen.getByText('₩2,805,000')).toBeInTheDocument()
    expect(screen.getByText('입금 예정일 · 6월 10일')).toBeInTheDocument()
  })

  it('로딩 중에는 금액 대신 스켈레톤만 보인다', () => {
    vi.mocked(useSettlementSummary).mockReturnValue({
      data: undefined,
      isPending: true,
    } as QueryResult)
    render(<SettlementSummaryCard />)
    expect(screen.queryByText(/정산 예정 금액/)).toBeNull()
  })
})
