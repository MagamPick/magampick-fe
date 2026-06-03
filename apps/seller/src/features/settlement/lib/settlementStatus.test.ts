import { describe, it, expect } from 'vitest'
import {
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_BADGE,
  depositLabelPrefix,
} from './settlementStatus'

describe('settlementStatus', () => {
  it('상태 라벨 — 정산 예정 / 입금완료', () => {
    expect(SETTLEMENT_STATUS_LABEL.SCHEDULED).toBe('정산 예정')
    expect(SETTLEMENT_STATUS_LABEL.DEPOSITED).toBe('입금완료')
  })

  it('상태별 배지 클래스 — 예정=warning / 완료=success 톤', () => {
    expect(SETTLEMENT_STATUS_BADGE.SCHEDULED).toContain('warning')
    expect(SETTLEMENT_STATUS_BADGE.DEPOSITED).toContain('success')
  })

  it('입금 라벨 접두 — 완료 / 예정', () => {
    expect(depositLabelPrefix('DEPOSITED')).toBe('입금 완료')
    expect(depositLabelPrefix('SCHEDULED')).toBe('입금 예정')
  })
})
