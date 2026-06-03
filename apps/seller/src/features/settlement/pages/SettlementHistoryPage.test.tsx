import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettlementHistoryPage } from './SettlementHistoryPage'
import { useSettlementCycles } from '../hooks/useSettlementCycles'
import { useSettlementSummary } from '../hooks/useSettlementSummary'
import type { SettlementCycle, SettlementSummary } from '../types'

vi.mock('../hooks/useSettlementCycles')
vi.mock('../hooks/useSettlementSummary')

type CyclesResult = ReturnType<typeof useSettlementCycles>
type SummaryResult = ReturnType<typeof useSettlementSummary>

const cycle = (o: Partial<SettlementCycle> = {}): SettlementCycle => ({
  id: 'st_2026_5_2',
  storeId: 's1',
  year: 2026,
  month: 5,
  half: 2,
  periodStart: new Date(2026, 4, 16).toISOString(),
  periodEnd: new Date(2026, 4, 31).toISOString(),
  depositDate: new Date(2026, 5, 10).toISOString(),
  grossAmount: 3_000_000,
  feeAmount: 195_000,
  netAmount: 2_805_000,
  status: 'SCHEDULED',
  ...o,
})

const summary: SettlementSummary = {
  cycleId: 'st_2026_5_2',
  periodLabel: '5월 2차 · 5/16~5/31',
  netAmount: 2_805_000,
  depositDate: new Date(2026, 5, 10).toISOString(),
  status: 'SCHEDULED',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SettlementHistoryPage />
    </MemoryRouter>,
  )
}

describe('SettlementHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSettlementSummary).mockReturnValue({
      data: summary,
      isPending: false,
    } as SummaryResult)
  })

  it('이번 회차 요약·회차 목록·수수료 안내·뒤로가기를 보여준다', () => {
    vi.mocked(useSettlementCycles).mockReturnValue({
      data: [
        cycle(),
        cycle({ id: 'st_2026_5_1', half: 1, status: 'DEPOSITED' }),
      ],
      isPending: false,
    } as CyclesResult)
    renderPage()
    expect(screen.getByText('₩2,805,000')).toBeInTheDocument() // 히어로
    expect(screen.getByText('5월 2차 · 5/16~5/31')).toBeInTheDocument() // 회차 행
    expect(screen.getByText('수수료 안내')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument()
  })

  it('정산 내역이 없으면 빈 메시지를 보여준다', () => {
    vi.mocked(useSettlementCycles).mockReturnValue({
      data: [] as SettlementCycle[],
      isPending: false,
    } as CyclesResult)
    renderPage()
    expect(screen.getByText('정산 내역이 없어요.')).toBeInTheDocument()
  })
})
