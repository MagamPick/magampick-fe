import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import type { SettlementCycle, SettlementSummary } from '../types'

// ─── BE SettlementCycleResponse Zod 스키마 ───────────────────────────────────

/**
 * BE SettlementCycleResponse Zod 스키마.
 * status 는 2-enum 으로 엄격 검증. half 는 1|2 리터럴.
 */
const settlementCycleSchema = z.object({
  id: z.number().optional(),
  storeId: z.number().optional(),
  year: z.number().optional(),
  month: z.number().optional(),
  half: z.union([z.literal(1), z.literal(2)]).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  depositDate: z.string().optional(),
  grossAmount: z.number().optional(),
  feeAmount: z.number().optional(),
  netAmount: z.number().optional(),
  status: z.enum(['SCHEDULED', 'DEPOSITED']),
})

/**
 * BE SettlementSummaryResponse Zod 스키마.
 * 가장 최근 SCHEDULED 회차 요약. 없으면 BE 가 204 반환.
 */
const settlementSummarySchema = z.object({
  cycleId: z.number().optional(),
  periodLabel: z.string().optional(),
  netAmount: z.number().optional(),
  depositDate: z.string().optional(),
  status: z.enum(['SCHEDULED', 'DEPOSITED']),
})

type SettlementCycleResponse = z.infer<typeof settlementCycleSchema>
type SettlementSummaryResponse = z.infer<typeof settlementSummarySchema>

// ─── BE → FE 도메인 매핑 ─────────────────────────────────────────────────────

/**
 * BE SettlementCycleResponse → FE SettlementCycle 변환.
 * - id·storeId: number → String()
 * - half: BE int32(1|2) → SettlementHalf
 * - grossAmount/feeAmount/netAmount: BE 계산값 신뢰·그대로 사용
 */
function mapToCycle(res: SettlementCycleResponse): SettlementCycle {
  return {
    id: String(res.id ?? 0),
    storeId: String(res.storeId ?? 0),
    year: res.year ?? 0,
    month: res.month ?? 0,
    half: res.half ?? 1,
    periodStart: res.periodStart ?? '',
    periodEnd: res.periodEnd ?? '',
    depositDate: res.depositDate ?? '',
    grossAmount: res.grossAmount ?? 0,
    feeAmount: res.feeAmount ?? 0,
    netAmount: res.netAmount ?? 0,
    status: res.status,
  }
}

/**
 * BE SettlementSummaryResponse → FE SettlementSummary 변환.
 * - cycleId: number → String()
 * - periodLabel: BE 값 사용 (FE 에서 formatPeriod 로 재산출 안 함)
 */
function mapToSummary(res: SettlementSummaryResponse): SettlementSummary {
  return {
    cycleId: String(res.cycleId ?? 0),
    periodLabel: res.periodLabel ?? '',
    netAmount: res.netAmount ?? 0,
    depositDate: res.depositDate ?? '',
    status: res.status,
  }
}

// ─── settlementApi ────────────────────────────────────────────────────────────

export const settlementApi = {
  /**
   * 매장 정산 회차 목록 — 최신순(year·month·half desc, BE 정렬).
   * ROLE_SELLER 인증 필요.
   */
  async listSettlementCycles(storeId: string): Promise<SettlementCycle[]> {
    const { data } = await apiClient.get(`/seller/stores/${storeId}/settlements`)
    return z.array(settlementCycleSchema).parse(data).map(mapToCycle)
  },

  /**
   * 이번 회차 정산 요약 — 가장 최근 SCHEDULED 회차.
   * BE 가 204 또는 빈 응답이면 null 반환(정산 예정 없음).
   * ROLE_SELLER 인증 필요.
   */
  async getSettlementSummary(storeId: string): Promise<SettlementSummary | null> {
    const res = await apiClient.get(`/seller/stores/${storeId}/settlements/summary`)
    if (res.status === 204 || !res.data) return null
    return mapToSummary(settlementSummarySchema.parse(res.data))
  },
}
