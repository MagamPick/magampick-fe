import { describe, it, expect } from 'vitest'
import { REFUND_STATUS_LABEL, statusToSegment, daysLeftToAutoApprove } from './refundStatus'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-06-01T12:00:00+09:00')

describe('REFUND_STATUS_LABEL', () => {
  it('환불 상태별 사장용 한글 라벨을 제공한다', () => {
    expect(REFUND_STATUS_LABEL.REQUESTED).toBe('승인 대기')
    expect(REFUND_STATUS_LABEL.APPROVED).toBe('환불 완료')
    expect(REFUND_STATUS_LABEL.REJECTED).toBe('거부됨')
  })
})

describe('statusToSegment', () => {
  it('요청됨은 대기중(pending) 세그먼트다', () => {
    expect(statusToSegment('REQUESTED')).toBe('pending')
  })

  it('승인·거부는 처리완료(resolved) 세그먼트다', () => {
    expect(statusToSegment('APPROVED')).toBe('resolved')
    expect(statusToSegment('REJECTED')).toBe('resolved')
  })
})

describe('daysLeftToAutoApprove', () => {
  it('방금 요청은 자동 승인까지 3일 남는다', () => {
    expect(daysLeftToAutoApprove(NOW.toISOString(), NOW)).toBe(3)
  })

  it('2일 전 요청은 1일 남는다', () => {
    expect(daysLeftToAutoApprove(new Date(NOW.getTime() - 2 * DAY).toISOString(), NOW)).toBe(1)
  })

  it('기한이 지난 요청은 0이다(음수 없음)', () => {
    expect(daysLeftToAutoApprove(new Date(NOW.getTime() - 4 * DAY).toISOString(), NOW)).toBe(0)
  })
})
