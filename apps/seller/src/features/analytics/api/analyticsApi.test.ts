import { describe, it, expect } from 'vitest'
import { analyticsApi } from './analyticsApi'
import { QUICK_EVAL_TAGS } from '../types'

describe('analyticsApi (mock)', () => {
  it('getAnalytics 는 매출·주문·떨이·리뷰 4개 패널을 가진 기간 데이터를 반환한다', async () => {
    const d = await analyticsApi.getAnalytics('s1', 'today')
    expect(d.sales.totalSales).toBe(380_000)
    expect(d.sales.chart.length).toBeGreaterThan(0)
    expect(d.orders.total).toBe(32)
    expect(d.clearance.soldQty).toBe(18)
    // 리뷰 태그는 고정 7종 전부 포함(카운트 0 포함) — 패널이 상위만 골라 보여줌
    expect(d.review.tags.map((t) => t.tag)).toEqual([...QUICK_EVAL_TAGS])
  })

  it('기간이 길수록 누적 매출이 크다 (오늘 < 이번 달)', async () => {
    const today = await analyticsApi.getAnalytics('s1', 'today')
    const month = await analyticsApi.getAnalytics('s1', 'month')
    expect(month.sales.totalSales).toBeGreaterThan(today.sales.totalSales)
  })

  it('올해 기간은 월별 막대를 반환한다', async () => {
    const year = await analyticsApi.getAnalytics('s1', 'year')
    expect(year.sales.chart.every((b) => b.label.endsWith('월'))).toBe(true)
  })

  it('매장별로 다른 규모를 반환하되, 비율값(객단가·별점)은 유지한다', async () => {
    const s1 = await analyticsApi.getAnalytics('s1', 'week')
    const s2 = await analyticsApi.getAnalytics('s2', 'week')
    expect(s2.sales.totalSales).toBeLessThan(s1.sales.totalSales)
    expect(s2.sales.totalSales).toBeGreaterThan(0)
    expect(s2.sales.avgOrderValue).toBe(s1.sales.avgOrderValue)
    expect(s2.review.avgRating).toBe(s1.review.avgRating)
  })
})
