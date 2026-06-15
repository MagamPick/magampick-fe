import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { nullish, nullableString, nullableNumber } from '@/shared/lib/zodNullable'
import { QUICK_EVAL_TAGS } from '../types'
import type { AnalyticsData, AnalyticsPeriod, QuickEvalTag } from '../types'

// ─── BE 기간 파라미터 변환 (FE 소문자 → BE 대문자) ────────────────────────────

/** FE AnalyticsPeriod(소문자) → BE 쿼리 파라미터(대문자) 변환 맵. D1 결정. */
const PERIOD_PARAM: Record<AnalyticsPeriod, string> = {
  today: 'TODAY',
  week: 'WEEK',
  month: 'MONTH',
  year: 'YEAR',
}

// ─── BE AnalyticsResponse Zod 스키마 ─────────────────────────────────────────

/** BE SalesBar 스키마 — 전 필드 SpringDoc optional. */
const salesBarSchema = z.object({
  label: nullableString(),
  amount: nullableNumber(),
})

/** BE SalesMetrics 스키마. */
const salesMetricsSchema = z.object({
  totalSales: nullableNumber(),
  deltaPct: nullableNumber(),
  chart: nullish(z.array(salesBarSchema)),
  avgOrderValue: nullableNumber(),
  peakHour: nullableString(),
})

/** BE OrderMetrics 스키마. */
const orderMetricsSchema = z.object({
  total: nullableNumber(),
  pickedUp: nullableNumber(),
  canceled: nullableNumber(),
  noShow: nullableNumber(),
})

/** BE ClearanceMetrics 스키마. */
const clearanceMetricsSchema = z.object({
  soldQty: nullableNumber(),
  savedQty: nullableNumber(),
  savedAmount: nullableNumber(),
  avgDiscountRate: nullableNumber(),
})

/** BE ReviewTagCount 스키마 — tag 는 한글 라벨 string (방어 필터는 매핑에서). */
const reviewTagCountSchema = z.object({
  tag: nullableString(),
  count: nullableNumber(),
})

/** BE ReviewMetrics 스키마. */
const reviewMetricsSchema = z.object({
  avgRating: nullableNumber(),
  newCount: nullableNumber(),
  replyRate: nullableNumber(),
  tags: nullish(z.array(reviewTagCountSchema)),
})

/** BE AnalyticsResponse 최상위 스키마. */
const analyticsResponseSchema = z.object({
  sales: nullish(salesMetricsSchema),
  orders: nullish(orderMetricsSchema),
  clearance: nullish(clearanceMetricsSchema),
  review: nullish(reviewMetricsSchema),
})

type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>

// ─── BE → FE 도메인 매핑 ─────────────────────────────────────────────────────

/**
 * BE AnalyticsResponse → FE AnalyticsData 변환.
 * - D3: 모든 BE optional 필드에 ?? 기본값 적용 (0 / [] / '')
 * - D4: tags 방어 필터 — QUICK_EVAL_TAGS 에 속한 한글 라벨만 통과, BE count desc 보존
 */
function mapToAnalytics(res: AnalyticsResponse): AnalyticsData {
  const sales = res.sales ?? {}
  const orders = res.orders ?? {}
  const clearance = res.clearance ?? {}
  const review = res.review ?? {}

  // D4: QUICK_EVAL_TAGS Set 으로 빠른 lookup — 미등록 라벨 드롭(크래시 X), BE 정렬 보존
  const validTagSet = new Set<string>(QUICK_EVAL_TAGS)
  const filteredTags = (review.tags ?? [])
    .filter(
      (t): t is { tag: string; count: number } =>
        typeof t.tag === 'string' &&
        validTagSet.has(t.tag) &&
        typeof t.count === 'number',
    )
    .map((t) => ({ tag: t.tag as QuickEvalTag, count: t.count }))

  return {
    sales: {
      totalSales: sales.totalSales ?? 0,
      deltaPct: sales.deltaPct ?? 0,
      chart: (sales.chart ?? []).map((b) => ({
        label: b.label ?? '',
        amount: b.amount ?? 0,
      })),
      avgOrderValue: sales.avgOrderValue ?? 0,
      peakHour: sales.peakHour ?? '',
    },
    orders: {
      total: orders.total ?? 0,
      pickedUp: orders.pickedUp ?? 0,
      canceled: orders.canceled ?? 0,
      noShow: orders.noShow ?? 0,
    },
    clearance: {
      soldQty: clearance.soldQty ?? 0,
      savedQty: clearance.savedQty ?? 0,
      savedAmount: clearance.savedAmount ?? 0,
      avgDiscountRate: clearance.avgDiscountRate ?? 0,
    },
    review: {
      avgRating: review.avgRating ?? 0,
      newCount: review.newCount ?? 0,
      replyRate: review.replyRate ?? 0,
      tags: filteredTags,
    },
  }
}

// ─── analyticsApi ─────────────────────────────────────────────────────────────

export const analyticsApi = {
  /**
   * 매장·기간 통계 조회.
   * ROLE_SELLER 인증 필요. 본인 소유 매장만 응답(BE 권한 체크).
   * D1: FE 소문자 period → PERIOD_PARAM 으로 BE 대문자 쿼리 변환.
   * D2: storeId string 유지 (URL 보간 — settlement 패턴 동일).
   */
  async getAnalytics(storeId: string, period: AnalyticsPeriod): Promise<AnalyticsData> {
    const { data } = await apiClient.get(`/seller/stores/${storeId}/analytics`, {
      params: { period: PERIOD_PARAM[period] },
    })
    return mapToAnalytics(analyticsResponseSchema.parse(data))
  },
}
