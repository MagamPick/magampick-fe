import { describe, it, expect } from 'vitest'
import { requestTossPayment } from './paymentStub'

describe('requestTossPayment (stub)', () => {
  it('즉시_승인_성공하고_paymentKey_발급', async () => {
    const result = await requestTossPayment({ amount: 16000, orderName: '크루아상 세트 외 1건' })
    expect(result.approved).toBe(true)
    expect(result.paymentKey).toMatch(/^stub_16000_/)
  })
})
