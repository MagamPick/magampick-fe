import { REFUND_WINDOW_DAYS } from '../types'
import type { Order, RefundStatus } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/** 환불 상태 라벨 (소비자 표시 — 주문 상세 배너·카드 배지) */
export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  REQUESTED: '환불 처리 중',
  APPROVED: '환불 완료',
  REJECTED: '환불 거부',
}

/** 환불 요청 마감 시각 = 픽업 완료 + N일 (노션 「환불 요청」: 픽업 후 3일) */
export function refundDeadline(completedAt: string): Date {
  return new Date(new Date(completedAt).getTime() + REFUND_WINDOW_DAYS * DAY_MS)
}

/**
 * 환불 요청 가능 여부 — 픽업 완료(COMPLETED)·미요청·완료 후 N일 이내.
 * (노션 「환불 요청」: 대상 COMPLETED, 기간 3일, 1주문 1요청 → refund 있으면 불가)
 */
export function canRequestRefund(order: Order, now: Date = new Date()): boolean {
  if (order.status !== 'COMPLETED') return false
  if (order.refund) return false
  if (!order.completedAt) return false
  return now.getTime() <= refundDeadline(order.completedAt).getTime()
}
