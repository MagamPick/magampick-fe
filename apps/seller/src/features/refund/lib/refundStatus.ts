import { REFUND_AUTO_APPROVE_DAYS } from '../types'
import type { RefundSegment, RefundStatus } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/** 환불 상태 라벨 (사장 표시) */
export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  REQUESTED: '승인 대기',
  APPROVED: '환불 완료',
  REJECTED: '거부됨',
}

/** 상태 배지 색 (프로토타입 status-badge 톤 매핑 — 준비중 amber 텍스트는 토큰 부재로 #b07a00) */
export const REFUND_STATUS_BADGE: Record<RefundStatus, string> = {
  REQUESTED: 'bg-warning/10 text-[#b07a00]',
  APPROVED: 'bg-success/10 text-success',
  REJECTED: 'bg-muted text-muted-foreground',
}

/** 상태 → 목록 세그먼트 (요청됨=대기중 / 승인·거부=처리완료) */
export function statusToSegment(status: RefundStatus): RefundSegment {
  return status === 'REQUESTED' ? 'pending' : 'resolved'
}

/**
 * 자동 승인까지 남은 일수 — 요청 후 N일(노션: 사장 미처리 시 자동 승인).
 * 올림(ceil)으로 "D-N" 표시, 기한 경과 시 0(음수 없음). FE 는 표시만, 실제 자동승인은 BE 배치.
 */
export function daysLeftToAutoApprove(requestedAt: string, now: Date = new Date()): number {
  const deadline = new Date(requestedAt).getTime() + REFUND_AUTO_APPROVE_DAYS * DAY_MS
  return Math.max(0, Math.ceil((deadline - now.getTime()) / DAY_MS))
}
