import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PointHistoryRow } from './PointHistoryRow'
import type { PointTransaction } from '../types'

const txn = (over: Partial<PointTransaction> = {}): PointTransaction => ({
  id: 't1',
  reason: 'earn',
  amount: 120,
  storeName: '브레드샵',
  date: '2026-05-28',
  ...over,
})

describe('PointHistoryRow', () => {
  it('적립 내역은 + 부호와 사유·매장을 표시', () => {
    render(
      <ul>
        <PointHistoryRow txn={txn({ reason: 'earn', amount: 120, storeName: '브레드샵' })} />
      </ul>,
    )
    expect(screen.getByText('+120P')).toBeInTheDocument()
    expect(screen.getByText('결제 적립 · 브레드샵')).toBeInTheDocument()
  })

  it('사용 내역은 - 부호', () => {
    render(
      <ul>
        <PointHistoryRow txn={txn({ reason: 'use', amount: 300 })} />
      </ul>,
    )
    expect(screen.getByText('-300P')).toBeInTheDocument()
  })

  it('매장이 없으면 시스템으로 표시', () => {
    render(
      <ul>
        <PointHistoryRow txn={txn({ reason: 'expire', amount: 200, storeName: null })} />
      </ul>,
    )
    expect(screen.getByText('소멸 · 시스템')).toBeInTheDocument()
  })
})
