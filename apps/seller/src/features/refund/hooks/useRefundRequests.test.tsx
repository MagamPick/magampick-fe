import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRefundRequests } from './useRefundRequests'
import { refundApi } from '../api/refundApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { RefundRequest } from '../types'

vi.mock('../api/refundApi')

const sample: RefundRequest = {
  id: 'rf1',
  orderId: 'o1',
  orderNo: '1019',
  storeId: 's1',
  customerName: '빵순이',
  items: [{ name: '크루아상', quantity: 1, price: 3000 }],
  amount: 3000,
  pickupCompletedAt: '2026-05-31T00:00:00.000Z',
  status: 'REQUESTED',
  reason: '사유',
  requestedAt: '2026-06-01T00:00:00.000Z',
}

describe('useRefundRequests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('매장 환불 요청 목록을 불러온다', async () => {
    vi.mocked(refundApi.listRefundRequests).mockResolvedValue([sample])

    const { result } = renderHook(() => useRefundRequests('s1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(refundApi.listRefundRequests).toHaveBeenCalledWith('s1')
    expect(result.current.data).toHaveLength(1)
  })
})
