import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SalesPanel } from './SalesPanel'
import type { SalesMetrics } from '../types'

const sales: SalesMetrics = {
  totalSales: 380_000,
  deltaPct: 8,
  chart: [
    { label: '10시', amount: 38_000 },
    { label: '18시', amount: 90_000 },
  ],
  avgOrderValue: 9_500,
  peakHour: '18 ~ 19시',
}

describe('SalesPanel', () => {
  it('기간 매출(₩)·라벨·객단가·최다 시간대·막대 라벨을 보여준다', () => {
    render(<SalesPanel sales={sales} period="today" />)
    expect(screen.getByText('오늘 매출')).toBeInTheDocument()
    expect(screen.getByText('₩380,000')).toBeInTheDocument()
    expect(screen.getByText('9,500원')).toBeInTheDocument()
    expect(screen.getByText('18 ~ 19시')).toBeInTheDocument()
    expect(screen.getByText('10시')).toBeInTheDocument()
  })

  it('증감률을 전기 대비 라벨과 함께 보여준다(상승)', () => {
    render(<SalesPanel sales={sales} period="today" />)
    expect(screen.getByLabelText('전기 대비 증가 8%')).toBeInTheDocument()
  })

  it('하락이면 감소 라벨로 표시한다', () => {
    render(<SalesPanel sales={{ ...sales, deltaPct: -5 }} period="month" />)
    expect(screen.getByLabelText('전기 대비 감소 5%')).toBeInTheDocument()
    expect(screen.getByText('이번 달 매출')).toBeInTheDocument()
  })
})
