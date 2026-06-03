import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRefundActions } from './useRefundActions'
import { refundKeys } from './refundKeys'
import { refundApi } from '../api/refundApi'
import type { RefundRequest } from '../types'

vi.mock('../api/refundApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const refund = (overrides: Partial<RefundRequest> = {}): RefundRequest => ({
  id: 'rf1',
  orderId: 'o1',
  orderNo: '1019',
  storeId: 's1',
  customerName: '빵순이',
  items: [],
  amount: 6000,
  pickupCompletedAt: '2026-05-31T00:00:00.000Z',
  status: 'REQUESTED',
  reason: '사유',
  requestedAt: '2026-06-01T00:00:00.000Z',
  ...overrides,
})

describe('useRefundActions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('승인 성공 시 목록을 무효화한다', async () => {
    vi.mocked(refundApi.approveRefund).mockResolvedValue(refund({ status: 'APPROVED' }))
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRefundActions('s1'), { wrapper })

    result.current.approve.mutate('rf1')

    await waitFor(() => expect(result.current.approve.isSuccess).toBe(true))
    expect(refundApi.approveRefund).toHaveBeenCalledWith('rf1')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: refundKeys.list('s1') })
  })

  it('거부 성공 시 사유를 전달하고 목록을 무효화한다', async () => {
    vi.mocked(refundApi.rejectRefund).mockResolvedValue(
      refund({ status: 'REJECTED', rejectReason: '거부 사유' }),
    )
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRefundActions('s1'), { wrapper })

    result.current.reject.mutate({ id: 'rf1', reason: '거부 사유' })

    await waitFor(() => expect(result.current.reject.isSuccess).toBe(true))
    expect(refundApi.rejectRefund).toHaveBeenCalledWith('rf1', '거부 사유')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: refundKeys.list('s1') })
  })
})
