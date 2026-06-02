import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useAnalytics } from './useAnalytics'
import { analyticsApi } from '../api/analyticsApi'
import type { AnalyticsData } from '../types'

vi.mock('../api/analyticsApi')

const data = (totalSales: number): AnalyticsData => ({
  sales: {
    totalSales,
    deltaPct: 8,
    chart: [{ label: '10시', amount: 1 }],
    avgOrderValue: 9_500,
    peakHour: '18 ~ 19시',
  },
  orders: { total: 32, pickedUp: 30, canceled: 1, noShow: 1 },
  clearance: { soldQty: 18, savedQty: 18, savedAmount: 41_000, avgDiscountRate: 47 },
  review: { avgRating: 4.8, newCount: 3, replyRate: 100, tags: [] },
})

describe('useAnalytics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('현재 매장·기간으로 통계를 조회한다', async () => {
    vi.mocked(analyticsApi.getAnalytics).mockResolvedValue(data(380_000))
    const { result } = renderHook(() => useAnalytics('s1', 'today'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(analyticsApi.getAnalytics).toHaveBeenCalledWith('s1', 'today')
    expect(result.current.data?.sales.totalSales).toBe(380_000)
  })

  it('기간이 바뀌면 그 기간으로 다시 조회한다', async () => {
    vi.mocked(analyticsApi.getAnalytics).mockResolvedValue(data(8_920_000))
    const { result } = renderHook(() => useAnalytics('s1', 'month'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(analyticsApi.getAnalytics).toHaveBeenCalledWith('s1', 'month')
  })
})
