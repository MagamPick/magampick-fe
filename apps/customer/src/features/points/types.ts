import { z } from 'zod'

/**
 * 포인트 도메인 타입 (노션: 포인트 적립/사용/내역/소멸, Phase 8).
 * 1P = 1원. 적립은 픽업완료 시 실결제 현금액의 1%(건별·유효 1년).
 * BE point 도메인 실연동 — 조회(잔액·내역). 차감은 결제(POST /orders)에 통합.
 * 적립 트리거(픽업완료)·소멸 배치·FIFO 차감·회수는 BE 엔진.
 */

/** 내역 사유 (BE UPPERCASE 그대로) */
export const pointReasonSchema = z.enum(['EARN', 'USE', 'EXPIRE', 'RESTORE', 'CLAWBACK'])
export type PointReason = z.infer<typeof pointReasonSchema>

/** 사유 → 한국어 라벨 */
export const POINT_REASON_LABEL: Record<PointReason, string> = {
  EARN: '결제 적립',
  USE: '결제 사용',
  EXPIRE: '소멸',
  RESTORE: '환불 복원',
  CLAWBACK: '적립 회수',
}

/**
 * 내역 방향 — 잔액 증가('EARN', +) vs 감소('USE', −).
 * 적립/환불 복원 = 증가, 결제 사용/소멸/적립 회수 = 감소.
 * 내역 탭(적립/사용) 필터·부호 표시의 기준.
 */
export function pointDirection(reason: PointReason): 'EARN' | 'USE' {
  return reason === 'EARN' || reason === 'RESTORE' ? 'EARN' : 'USE'
}

/** 포인트 내역 한 건 (BE PointTransactionResponse) */
export const pointTransactionSchema = z.object({
  id: z.number(),
  reason: pointReasonSchema,
  /** 변동 포인트 (양수) — 부호는 reason 방향으로 표시 */
  amount: z.number(),
  /** 관련 매장명 (시스템 사유는 null) */
  storeName: z.string().nullable(),
  /** 발생 시각 (ISO 8601 date-time) — 날짜 표시는 .slice(0,10) 사용 */
  occurredAt: z.string(),
})
export type PointTransaction = z.infer<typeof pointTransactionSchema>

/** 포인트 요약 — 사용 가능 잔액 (BE PointSummaryResponse) */
export const pointSummarySchema = z.object({
  balance: z.number(),
})
export type PointSummary = z.infer<typeof pointSummarySchema>

/** 내역 탭 필터 — 전체 / 적립 / 사용 (BE filter 파라미터) */
export const pointHistoryFilterSchema = z.enum(['ALL', 'EARN', 'USE'])
export type PointHistoryFilter = z.infer<typeof pointHistoryFilterSchema>
