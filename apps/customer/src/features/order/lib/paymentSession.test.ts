import { describe, it, expect, beforeEach } from 'vitest'
import { stashPaymentSession, restorePaymentSession, clearPaymentSession } from './paymentSession'

beforeEach(() => {
  sessionStorage.clear()
})

describe('paymentSession', () => {
  it('stash_후_restore_하면_동일_값_반환', () => {
    stashPaymentSession({ orderId: 42, amount: 6000 })
    const result = restorePaymentSession()
    expect(result).toEqual({ orderId: 42, amount: 6000 })
  })

  it('세션_없으면_restore_null 반환', () => {
    expect(restorePaymentSession()).toBeNull()
  })

  it('clear_후_restore_하면_null 반환', () => {
    stashPaymentSession({ orderId: 1, amount: 1000 })
    clearPaymentSession()
    expect(restorePaymentSession()).toBeNull()
  })

  it('잘못된_JSON_이면_null 반환', () => {
    sessionStorage.setItem('magampick_payment_session', 'not-json{')
    expect(restorePaymentSession()).toBeNull()
  })

  it('필드_타입_불일치_이면_null 반환', () => {
    sessionStorage.setItem('magampick_payment_session', JSON.stringify({ orderId: '문자열', amount: 6000 }))
    expect(restorePaymentSession()).toBeNull()
  })
})
