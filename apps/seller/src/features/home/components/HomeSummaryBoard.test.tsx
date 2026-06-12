import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeSummaryBoard } from './HomeSummaryBoard'
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics'
import type { AnalyticsData } from '@/features/analytics/types'

vi.mock('@/features/analytics/hooks/useAnalytics')

// 더미(₩342,000/18건/94%)와 다른 값 — 정적이면 red, 훅 연결되면 green
const data: AnalyticsData = {
  sales: { totalSales: 500000, deltaPct: 0, chart: [], avgOrderValue: 0, peakHour: '' },
  orders: { total: 7, pickedUp: 6, canceled: 1, noShow: 0 },
  clearance: { soldQty: 0, savedQty: 0, savedAmount: 0, avgDiscountRate: 0 },
  review: { avgRating: 0, newCount: 0, replyRate: 0, tags: [] },
}

beforeEach(() => vi.clearAllMocks())

describe('HomeSummaryBoard', () => {
  it('오늘_매출_주문_픽업완료율을_통계에서_표시', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      data,
    } as unknown as ReturnType<typeof useAnalytics>)

    render(<HomeSummaryBoard />)

    expect(screen.getByText('₩500,000')).toBeInTheDocument()
    expect(screen.getByText('7건')).toBeInTheDocument()
    expect(screen.getByText('86%')).toBeInTheDocument() // pickupRate(6,7)=86
  })

  it('데이터_로딩전엔_대시로_표시', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useAnalytics>)

    render(<HomeSummaryBoard />)

    expect(screen.getAllByText('—')).toHaveLength(3)
  })
})
