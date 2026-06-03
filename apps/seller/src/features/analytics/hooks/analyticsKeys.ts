import type { AnalyticsPeriod } from '../types'

/** 통계 도메인 queryKey 헬퍼 (state-convention §3) — 매장·기간 단위 캐시. */
export const analyticsKeys = {
  all: ['analytics'] as const,
  detail: (storeId: string, period: AnalyticsPeriod) =>
    [...analyticsKeys.all, storeId, period] as const,
}
