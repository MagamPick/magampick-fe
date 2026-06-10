import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePrepareAndPay } from './usePrepareAndPay'
import { orderApi } from '../api/orderApi'
import { requestTossPaymentSdk } from '../lib/tossPaymentSdk'
import { stashPaymentSession } from '../lib/paymentSession'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { PrepareAndPayVars } from './usePrepareAndPay'

vi.mock('../api/orderApi', () => ({
  orderApi: {
    prepare: vi.fn(),
  },
  buildCreateOrderRequest: vi.fn(),
}))

vi.mock('../lib/tossPaymentSdk', () => ({
  requestTossPaymentSdk: vi.fn(),
}))

vi.mock('../lib/paymentSession', () => ({
  stashPaymentSession: vi.fn(),
  restorePaymentSession: vi.fn(),
  clearPaymentSession: vi.fn(),
}))

const vars: PrepareAndPayVars = {
  store: { id: 'st-1', name: '브레드샵' },
  items: [
    { id: 'd1', kind: 'deal', name: '크루아상', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 1 },
  ],
  pickup: { type: 'asap' },
  memo: '',
  amounts: { normalTotal: 10000, discountTotal: 4000, payTotal: 6000 },
}

describe('usePrepareAndPay', () => {
  beforeEach(() => {
    vi.mocked(orderApi.prepare).mockReset()
    vi.mocked(requestTossPaymentSdk).mockReset()
    vi.mocked(stashPaymentSession).mockReset()
  })

  it('prepare_성공_후_세션_stash_하고_결제창_호출', async () => {
    vi.mocked(orderApi.prepare).mockResolvedValueOnce({
      orderId: 42,
      tossOrderId: 'order-42',
      amount: 6000,
      orderName: '크루아상',
    })
    vi.mocked(requestTossPaymentSdk).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => usePrepareAndPay(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.mutate(vars)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(stashPaymentSession).toHaveBeenCalledWith({ orderId: 42, amount: 6000 })
    expect(requestTossPaymentSdk).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 6000, orderId: 'order-42' }),
    )
  })

  it('prepare_실패_시_mutation_isError', async () => {
    vi.mocked(orderApi.prepare).mockRejectedValueOnce(new Error('매장 없음'))

    const { result } = renderHook(() => usePrepareAndPay(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.mutate(vars)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(stashPaymentSession).not.toHaveBeenCalled()
  })
})
