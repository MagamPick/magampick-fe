import type { SettlementStatus } from '../types'

/** 정산 상태 라벨 (프로토타입 42-settlement status-badge 텍스트) */
export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  SCHEDULED: '정산 예정',
  DEPOSITED: '입금완료',
}

/**
 * 상태 배지 색 — 프로토타입 status-badge 톤 매핑 (refundStatus 미러).
 * 정산예정 = prep(#FFF6E5/#B07A00 amber), 입금완료 = done(#EAF7EE/success).
 */
export const SETTLEMENT_STATUS_BADGE: Record<SettlementStatus, string> = {
  SCHEDULED: 'bg-warning/10 text-[#b07a00]',
  DEPOSITED: 'bg-success/10 text-success',
}

/** 입금 라벨 접두 — 정산예정="입금 예정" / 입금완료="입금 완료" (프로토타입 settle-row__date) */
export function depositLabelPrefix(status: SettlementStatus): string {
  return status === 'DEPOSITED' ? '입금 완료' : '입금 예정'
}
