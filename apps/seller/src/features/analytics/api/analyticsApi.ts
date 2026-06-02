import { QUICK_EVAL_TAGS } from '../types'
import type { AnalyticsData, AnalyticsPeriod, QuickEvalTag, ReviewTagCount } from '../types'

/**
 * ⚠️ Mock 스텁 — 통계(analytics) BE 미구현. 읽기 전용이라 in-memory 상태 없음(매장·정산 mock 과 달리).
 * 한 기준 매장(s1, 역삼점)의 기간별 데이터를 손으로 시드하고, 다른 매장은 규모 스케일만 적용한다
 * (본인 소유 매장만 — mock 은 단일 사장 가정. 권한 체크는 BE/연동 책임).
 * 매출 = 픽업 완료 주문 결제액 합계 = 총매출(수수료 차감 전, 정산액과 다름 — types 주석 참조).
 * 막대 amount 합 ≈ 기간 매출이 되도록 시드. 실연동 시 apiClient + Zod 응답 검증으로 교체.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** 부분 카운트 맵 → 고정 7종 전부 채운 태그 배열(누락은 0). 순서는 QUICK_EVAL_TAGS. */
function tags(counts: Partial<Record<QuickEvalTag, number>>): ReviewTagCount[] {
  return QUICK_EVAL_TAGS.map((tag) => ({ tag, count: counts[tag] ?? 0 }))
}

/** 기준 매장(s1) 기간별 시드. */
const BASE: Record<AnalyticsPeriod, AnalyticsData> = {
  today: {
    sales: {
      totalSales: 380_000,
      deltaPct: 8,
      chart: [
        { label: '10시', amount: 38_000 },
        { label: '12시', amount: 84_000 },
        { label: '14시', amount: 52_000 },
        { label: '16시', amount: 64_000 },
        { label: '18시', amount: 90_000 },
        { label: '20시', amount: 52_000 },
      ],
      avgOrderValue: 9_500,
      peakHour: '18 ~ 19시',
    },
    orders: { total: 32, pickedUp: 30, canceled: 1, noShow: 1 },
    clearance: { soldQty: 18, savedQty: 18, savedAmount: 41_000, avgDiscountRate: 47 },
    review: {
      avgRating: 4.8,
      newCount: 3,
      replyRate: 100,
      tags: tags({ 친절해요: 3, 신선해요: 2, 맛있어요: 2, '픽업 빨라요': 1, 재구매: 1 }),
    },
  },
  week: {
    sales: {
      totalSales: 2_140_000,
      deltaPct: 12,
      chart: [
        { label: '월', amount: 232_000 },
        { label: '화', amount: 268_000 },
        { label: '수', amount: 250_000 },
        { label: '목', amount: 312_000 },
        { label: '금', amount: 372_000 },
        { label: '토', amount: 410_000 },
        { label: '일', amount: 296_000 },
      ],
      avgOrderValue: 11_800,
      peakHour: '18 ~ 20시',
    },
    orders: { total: 124, pickedUp: 116, canceled: 5, noShow: 3 },
    clearance: { soldQty: 88, savedQty: 88, savedAmount: 214_000, avgDiscountRate: 48 },
    review: {
      avgRating: 4.7,
      newCount: 14,
      replyRate: 79,
      tags: tags({
        친절해요: 9,
        맛있어요: 7,
        신선해요: 8,
        재구매: 6,
        '양 많아요': 5,
        가성비: 4,
        '픽업 빨라요': 3,
      }),
    },
  },
  month: {
    sales: {
      totalSales: 8_920_000,
      deltaPct: 18,
      chart: [
        { label: '1주', amount: 1_520_000 },
        { label: '2주', amount: 1_660_000 },
        { label: '3주', amount: 1_840_000 },
        { label: '4주', amount: 2_560_000 },
        { label: '5주', amount: 1_340_000 },
      ],
      avgOrderValue: 12_400,
      peakHour: '18 ~ 20시',
    },
    orders: { total: 512, pickedUp: 478, canceled: 21, noShow: 13 },
    clearance: { soldQty: 364, savedQty: 364, savedAmount: 902_000, avgDiscountRate: 49 },
    review: {
      avgRating: 4.7,
      newCount: 58,
      replyRate: 84,
      tags: tags({
        친절해요: 38,
        맛있어요: 31,
        신선해요: 34,
        재구매: 27,
        '양 많아요': 22,
        가성비: 19,
        '픽업 빨라요': 14,
      }),
    },
  },
  // 올해 = 월별 막대 (mock 스냅샷: 1~6월). 실연동 시 누적 월별로 교체.
  year: {
    sales: {
      totalSales: 45_200_000,
      deltaPct: 22,
      chart: [
        { label: '1월', amount: 7_200_000 },
        { label: '2월', amount: 6_800_000 },
        { label: '3월', amount: 8_100_000 },
        { label: '4월', amount: 8_500_000 },
        { label: '5월', amount: 9_400_000 },
        { label: '6월', amount: 5_200_000 },
      ],
      avgOrderValue: 12_100,
      peakHour: '18 ~ 20시',
    },
    orders: { total: 2_680, pickedUp: 2_510, canceled: 102, noShow: 68 },
    clearance: { soldQty: 1_920, savedQty: 1_920, savedAmount: 4_760_000, avgDiscountRate: 48 },
    review: {
      avgRating: 4.7,
      newCount: 312,
      replyRate: 86,
      tags: tags({
        친절해요: 198,
        맛있어요: 171,
        신선해요: 182,
        재구매: 144,
        '양 많아요': 121,
        가성비: 96,
        '픽업 빨라요': 73,
      }),
    },
  },
}

/** 매장 규모 스케일 — s1 기준 1.0, 그 외는 축소(닫힌 강남점 등). 비율값(객단가·할인율·별점·답글률·증감)은 유지. */
const STORE_SCALE: Record<string, number> = { s1: 1, s2: 0.32 }

/** 절대량(매출·건수·수량·태그 카운트)만 스케일, 비율값은 그대로. */
function scaleAnalytics(d: AnalyticsData, factor: number): AnalyticsData {
  const s = (n: number) => Math.round(n * factor)
  return {
    sales: {
      totalSales: s(d.sales.totalSales),
      deltaPct: d.sales.deltaPct,
      chart: d.sales.chart.map((b) => ({ label: b.label, amount: s(b.amount) })),
      avgOrderValue: d.sales.avgOrderValue,
      peakHour: d.sales.peakHour,
    },
    orders: {
      total: s(d.orders.total),
      pickedUp: s(d.orders.pickedUp),
      canceled: s(d.orders.canceled),
      noShow: s(d.orders.noShow),
    },
    clearance: {
      soldQty: s(d.clearance.soldQty),
      savedQty: s(d.clearance.savedQty),
      savedAmount: s(d.clearance.savedAmount),
      avgDiscountRate: d.clearance.avgDiscountRate,
    },
    review: {
      avgRating: d.review.avgRating,
      newCount: s(d.review.newCount),
      replyRate: d.review.replyRate,
      tags: d.review.tags.map((t) => ({ tag: t.tag, count: s(t.count) })),
    },
  }
}

export const analyticsApi = {
  /** 매장·기간 통계 조회. 본인 소유 매장만(mock 은 단일 사장 가정 — 알 수 없는 매장도 축소 데이터). */
  async getAnalytics(storeId: string, period: AnalyticsPeriod): Promise<AnalyticsData> {
    await delay(300)
    const factor = STORE_SCALE[storeId] ?? 0.5
    return scaleAnalytics(BASE[period], factor)
  },
}
