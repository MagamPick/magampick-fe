import { z } from 'zod'

/**
 * 포인트 도메인 타입 (노션: 포인트 적립/사용/내역/소멸, Phase 8).
 * 1P = 1원. 적립은 픽업완료 시 실결제 현금액의 1%(건별·유효 1년).
 * 백엔드 point 도메인 미구현 → mock. FE 표면 = 잔액 + 내역 조회 + 결제 시 차감.
 * 적립 트리거(픽업완료)·소멸 배치·FIFO 차감·회수는 BE 엔진 — 여기선 seed 된 내역으로만 반영.
 */

/** 내역 사유 (노션: 결제 적립·결제 사용·소멸·환불 복원·적립 회수) */
export const pointReasonSchema = z.enum(['earn', 'use', 'expire', 'restore', 'clawback'])
export type PointReason = z.infer<typeof pointReasonSchema>

/** 사유 → 한국어 라벨 */
export const POINT_REASON_LABEL: Record<PointReason, string> = {
  earn: '결제 적립',
  use: '결제 사용',
  expire: '소멸',
  restore: '환불 복원',
  clawback: '적립 회수',
}

/**
 * 내역 방향 — 잔액 증가(earn, +) vs 감소(use, −).
 * 적립/환불 복원 = 증가, 결제 사용/소멸/적립 회수 = 감소.
 * 내역 탭(적립/사용) 필터·부호 표시의 기준.
 */
export function pointDirection(reason: PointReason): 'earn' | 'use' {
  return reason === 'earn' || reason === 'restore' ? 'earn' : 'use'
}

/** 포인트 내역 한 건 */
export const pointTransactionSchema = z.object({
  id: z.string(),
  reason: pointReasonSchema,
  /** 변동 포인트 (양수) — 부호는 reason 방향으로 표시 */
  amount: z.number().int().positive(),
  /** 관련 매장명 (시스템 사유는 null) */
  storeName: z.string().nullable(),
  /** 발생일 (YYYY-MM-DD) */
  date: z.string(),
})
export type PointTransaction = z.infer<typeof pointTransactionSchema>

/** 포인트 요약 — 사용 가능 잔액 */
export const pointSummarySchema = z.object({
  balance: z.number().int().min(0),
})
export type PointSummary = z.infer<typeof pointSummarySchema>

/** 내역 탭 필터 — 전체 / 적립 / 사용 */
export const pointHistoryFilterSchema = z.enum(['all', 'earn', 'use'])
export type PointHistoryFilter = z.infer<typeof pointHistoryFilterSchema>
