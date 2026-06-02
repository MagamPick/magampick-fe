import { describe, it, expect } from 'vitest'
import { canRequestRefund, refundDeadline, REFUND_STATUS_LABEL } from './refundPolicy'
import type { Order } from '../types'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-06-01T12:00:00+09:00')

/** 테스트용 완료주문 — 1일 전 픽업 완료, 환불 없음 */
const BASE: Order = {
  id: 'o_test',
  orderNo: '1000',
  storeId: 'st1',
  storeName: '테스트 매장',
  items: [
    {
      id: 'i1',
      kind: 'deal',
      name: '빵',
      imageUrl: null,
      originalPrice: 1000,
      salePrice: 900,
      qty: 1,
    },
  ],
  pickup: { type: 'asap' },
  memo: '',
  amounts: { normalTotal: 1000, discountTotal: 100, payTotal: 900 },
  pickupCode: '1234',
  status: 'COMPLETED',
  paymentMethod: 'toss',
  createdAt: new Date(NOW.getTime() - 2 * DAY).toISOString(),
  completedAt: new Date(NOW.getTime() - 1 * DAY).toISOString(),
}
const order = (overrides: Partial<Order> = {}): Order => ({ ...BASE, ...overrides })

describe('canRequestRefund', () => {
  it('픽업 완료 후 3일 이내·미요청 주문은 요청 가능', () => {
    expect(canRequestRefund(order(), NOW)).toBe(true)
  })

  it('픽업 완료 3일 경과 주문은 요청 불가', () => {
    expect(
      canRequestRefund(
        order({ completedAt: new Date(NOW.getTime() - 4 * DAY).toISOString() }),
        NOW,
      ),
    ).toBe(false)
  })

  it('마감 경계(정확히 3일)는 아직 요청 가능', () => {
    expect(
      canRequestRefund(
        order({ completedAt: new Date(NOW.getTime() - 3 * DAY).toISOString() }),
        NOW,
      ),
    ).toBe(true)
  })

  it('이미 환불 요청된 주문은 재요청 불가 (1주문 1요청)', () => {
    const requested = order({
      refund: { status: 'REQUESTED', reason: '단순 변심', requestedAt: NOW.toISOString() },
    })
    expect(canRequestRefund(requested, NOW)).toBe(false)
  })

  it('환불 거부된 주문도 재요청 불가', () => {
    const rejected = order({
      refund: {
        status: 'REJECTED',
        reason: '단순 변심',
        requestedAt: NOW.toISOString(),
        rejectReason: '이미 수령한 상품이에요',
      },
    })
    expect(canRequestRefund(rejected, NOW)).toBe(false)
  })

  it('픽업 완료가 아닌 주문은 요청 불가', () => {
    expect(canRequestRefund(order({ status: 'READY' }), NOW)).toBe(false)
    expect(canRequestRefund(order({ status: 'CANCELLED' }), NOW)).toBe(false)
  })

  it('완료 시각이 없으면 요청 불가', () => {
    expect(canRequestRefund(order({ completedAt: undefined }), NOW)).toBe(false)
  })
})

describe('refundDeadline', () => {
  it('픽업 완료 시각 + 3일을 마감으로 계산한다', () => {
    expect(refundDeadline('2026-05-30T12:00:00+09:00').toISOString()).toBe(
      new Date('2026-06-02T12:00:00+09:00').toISOString(),
    )
  })
})

describe('REFUND_STATUS_LABEL', () => {
  it('환불 상태별 한글 라벨을 제공한다', () => {
    expect(REFUND_STATUS_LABEL.REQUESTED).toBe('환불 처리 중')
    expect(REFUND_STATUS_LABEL.APPROVED).toBe('환불 완료')
    expect(REFUND_STATUS_LABEL.REJECTED).toBe('환불 거부')
  })
})
