import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import {
  pointSummarySchema,
  pointTransactionSchema,
  type PointHistoryFilter,
  type PointSummary,
  type PointTransaction,
} from '../types'

/**
 * 포인트 API — 실 BE 연동 (Phase 8).
 * GET /api/v1/customers/me/points/summary — 잔액
 * GET /api/v1/customers/me/points/history?filter=ALL|EARN|USE — 내역
 * 차감(사용)은 결제(POST /orders)에 통합됨 — use 함수 없음.
 */
export const pointApi = {
  /** 사용 가능 잔액 */
  async getSummary(): Promise<PointSummary> {
    const { data } = await apiClient.get('/customers/me/points/summary')
    return pointSummarySchema.parse(data)
  },

  /** 내역 (최신순) — 탭 필터(ALL/EARN/USE) */
  async listHistory(filter: PointHistoryFilter = 'ALL'): Promise<PointTransaction[]> {
    const { data } = await apiClient.get('/customers/me/points/history', {
      params: { filter },
    })
    return z.array(pointTransactionSchema).parse(data)
  },
}
