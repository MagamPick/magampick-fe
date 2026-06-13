/**
 * 정산(settlement) 도메인 타입 — 노션 「정산 처리」(시스템 배치)·「정산 내역 조회」(사장), Phase 6.
 * 정산 = 픽업 완료 주문을 반월 회차로 집계 → 수수료(6.5%) 뗀 정산액 산출(real) → 송금(stub) → 입금완료.
 * BE settlement 도메인 실연동 — apiClient + Zod 응답 검증(settlementApi). 금액 계산은 settlementCalc 순수 로직.
 */

/** 수수료율 — 중개 5.0% + 결제 1.5% = 합 6.5% (노션 「정산 처리」, 금액 계산 real) */
export const BROKERAGE_RATE = 0.05
export const PAYMENT_RATE = 0.015
export const TOTAL_FEE_RATE = BROKERAGE_RATE + PAYMENT_RATE // 0.065

/** 정산 상태 — 정산예정(잠정) / 입금완료(확정). 송금은 stub, 상태만 전이(노션 「정산 처리」) */
export type SettlementStatus = 'SCHEDULED' | 'DEPOSITED'

/** 반월 회차 — 1차(1~15일) / 2차(16~말일) */
export type SettlementHalf = 1 | 2

/**
 * 정산 회차 — 매장·반월 단위 1건 (금액 = KRW).
 * feeAmount/netAmount = grossAmount 에서 settlementCalc 로 산출(real).
 * 환불건은 확정 집계에서 제외 — gross 에 이미 반영된 것으로 간주(노션: 입금 전 환불 마감, 차감 불필요).
 */
export interface SettlementCycle {
  id: string
  storeId: string
  year: number
  /** 1~12 */
  month: number
  half: SettlementHalf
  /** 정산 기간 시작/끝 (ISO) */
  periodStart: string
  periodEnd: string
  /** 입금(예정)일 (ISO) — 1차→당월 25일 / 2차→익월 10일 */
  depositDate: string
  /** 결제액 합계 (집계 mock) */
  grossAmount: number
  /** 수수료 — real: round(gross × 6.5%) */
  feeAmount: number
  /** 정산액 = grossAmount − feeAmount (real) */
  netAmount: number
  status: SettlementStatus
}

/** 이번 회차 정산 요약 (마이 허브 카드 + 정산 내역 히어로) */
export interface SettlementSummary {
  cycleId: string
  /** "6월 1차 · 6/1~6/15" */
  periodLabel: string
  /** 정산 예정 금액 = netAmount */
  netAmount: number
  /** 입금(예정)일 (ISO) */
  depositDate: string
  status: SettlementStatus
}
