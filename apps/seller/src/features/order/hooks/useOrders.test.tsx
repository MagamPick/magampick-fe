import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrders } from './useOrders'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Order } from '../types'

vi.mock('../api/orderApi')

const sample: Order = {
  id: 'o1',
  storeId: 's1',
  orderNo: '1024',
  customerName: '빵순이',
  customerPhone: '010-2847-3920',
  placedAt: '2026-06-01T04:40:00.000Z',
  pickupTime: '14:30',
  pickupCode: '4827',
  status: 'PENDING',
  items: [{ name: '버터 크루아상', quantity: 1, price: 3000 }],
  total: 3000,
  paymentMethod: '토스페이',
}

describe('useOrders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('현재 매장의 주문 목록을 조회한다', async () => {
    vi.mocked(orderApi.listOrders).mockResolvedValue([sample])

    const { result } = renderHook(() => useOrders('s1'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderApi.listOrders).toHaveBeenCalledWith('s1')
    expect(result.current.data).toEqual([sample])
  })
})
