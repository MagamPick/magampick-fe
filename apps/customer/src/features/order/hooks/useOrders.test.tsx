import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrders } from './useOrders'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Order } from '../types'

vi.mock('../api/orderApi')

describe('useOrders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('주문 목록을 조회한다', async () => {
    const list: Order[] = []
    vi.mocked(orderApi.listOrders).mockResolvedValue(list)

    const { result } = renderHook(() => useOrders(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderApi.listOrders).toHaveBeenCalledOnce()
    expect(result.current.data).toEqual(list)
  })
})
