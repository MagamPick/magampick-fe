import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestTossPaymentSdk, type TossSdkPaymentParams } from './tossPaymentSdk'
import { env } from '@/shared/lib/env'

// vi.hoisted: vi.mock 팩토리보다 먼저 평가되는 변수 정의
const mocks = vi.hoisted(() => {
  const mockRequestPayment = vi.fn().mockResolvedValue(undefined)
  const mockPayment = vi.fn(() => ({ requestPayment: mockRequestPayment }))
  const mockLoadTossPayments = vi.fn().mockResolvedValue({ payment: mockPayment })
  return { mockRequestPayment, mockPayment, mockLoadTossPayments }
})

// ⚠️ jsdom에서 실 SDK 로드 금지 — 반드시 vi.mock 으로 목킹
vi.mock('@tosspayments/tosspayments-sdk', () => ({
  loadTossPayments: mocks.mockLoadTossPayments,
  ANONYMOUS: 'ANONYMOUS',
}))

vi.mock('@/shared/lib/env', () => ({
  env: { VITE_TOSS_CLIENT_KEY: 'test_ck_mock' },
}))

const defaultParams: TossSdkPaymentParams = {
  amount: 6000,
  orderId: 'order-42',
  orderName: '크루아상 세트',
  successUrl: 'https://example.com/payment/success',
  failUrl: 'https://example.com/payment/fail',
}

describe('requestTossPaymentSdk', () => {
  beforeEach(() => {
    mocks.mockRequestPayment.mockReset()
    mocks.mockRequestPayment.mockResolvedValue(undefined)
  })

  it('requestPayment 에 토스페이 단독 옵션 포함 — card.flowMode=DIRECT, easyPay=토스페이', async () => {
    await requestTossPaymentSdk(defaultParams)

    expect(mocks.mockRequestPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'CARD',
        card: { flowMode: 'DIRECT', easyPay: '토스페이' },
        amount: { currency: 'KRW', value: 6000 },
        orderId: 'order-42',
        orderName: '크루아상 세트',
        successUrl: 'https://example.com/payment/success',
        failUrl: 'https://example.com/payment/fail',
      }),
    )
  })

  it('requestPayment 를 1회 호출', async () => {
    await requestTossPaymentSdk(defaultParams)
    expect(mocks.mockRequestPayment).toHaveBeenCalledTimes(1)
  })

  it('VITE_TOSS_CLIENT_KEY 없을 때 즉시 throw', async () => {
    const saved = env.VITE_TOSS_CLIENT_KEY
    ;(env as Record<string, unknown>).VITE_TOSS_CLIENT_KEY = undefined
    await expect(requestTossPaymentSdk(defaultParams)).rejects.toThrow('VITE_TOSS_CLIENT_KEY')
    ;(env as Record<string, unknown>).VITE_TOSS_CLIENT_KEY = saved
  })
})
