import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SettlementCycleRow } from './SettlementCycleRow'
import type { SettlementCycle } from '../types'

// depositDate 는 로컬 Date → ISO 로 만들어 TZ 무관하게 round-trip 되게 한다.
const cycle = (o: Partial<SettlementCycle> = {}): SettlementCycle => ({
  id: 'st_2026_5_2',
  storeId: 's1',
  year: 2026,
  month: 5,
  half: 2,
  periodStart: new Date(2026, 4, 16).toISOString(),
  periodEnd: new Date(2026, 4, 31).toISOString(),
  depositDate: new Date(2026, 5, 10).toISOString(), // 6월 10일
  grossAmount: 3_000_000,
  feeAmount: 195_000,
  netAmount: 2_805_000,
  status: 'SCHEDULED',
  ...o,
})

describe('SettlementCycleRow', () => {
  it('정산예정 회차 — 기간·입금예정일·정산액·상태를 표시한다', () => {
    render(<SettlementCycleRow cycle={cycle()} />)
    expect(screen.getByText('5월 2차 · 5/16~5/31')).toBeInTheDocument()
    expect(screen.getByText('입금 예정 · 6월 10일')).toBeInTheDocument()
    expect(screen.getByText('2,805,000원')).toBeInTheDocument()
    expect(screen.getByText('정산 예정')).toBeInTheDocument()
  })

  it('입금완료 회차 — "입금 완료" 접두와 완료 배지를 표시한다', () => {
    render(<SettlementCycleRow cycle={cycle({ status: 'DEPOSITED' })} />)
    expect(screen.getByText('입금 완료 · 6월 10일')).toBeInTheDocument()
    expect(screen.getByText('입금완료')).toBeInTheDocument()
  })
})
