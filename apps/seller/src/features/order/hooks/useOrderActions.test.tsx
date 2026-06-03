import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOrderActions } from './useOrderActions'
import { orderKeys } from './orderKeys'
import { orderApi } from '../api/orderApi'
import type { Order, OrderStatus } from '../types'

vi.mock('../api/orderApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

function order(id: string, status: OrderStatus): Order {
  return {
    id,
    storeId: 's1',
    orderNo: '1024',
    customerName: '빵순이',
    customerPhone: '010-2847-3920',
    placedAt: '2026-06-01T04:40:00.000Z',
    pickupTime: '14:30',
    pickupCode: '4827',
    status,
    items: [],
    total: 0,
    paymentMethod: '토스페이',
  }
}

describe('useOrderActions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('수락 성공 시 목록과 해당 주문 상세를 무효화한다', async () => {
    vi.mocked(orderApi.acceptOrder).mockResolvedValue(order('o1', 'PREPARING'))
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useOrderActions('s1'), { wrapper })

    result.current.accept.mutate('o1')

    await waitFor(() => expect(result.current.accept.isSuccess).toBe(true))
    expect(orderApi.acceptOrder).toHaveBeenCalledWith('o1')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: orderKeys.list('s1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: orderKeys.detail('o1') })
  })

  it('거절/준비완료/수령완료/미수령 mutation 을 모두 제공한다', async () => {
    vi.mocked(orderApi.rejectOrder).mockResolvedValue(order('o2', 'REJECTED'))
    vi.mocked(orderApi.readyOrder).mockResolvedValue(order('o4', 'READY'))
    vi.mocked(orderApi.completeOrder).mockResolvedValue(order('o6', 'COMPLETED'))
    vi.mocked(orderApi.noShowOrder).mockResolvedValue(order('o6', 'NO_SHOW'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrderActions('s1'), { wrapper })

    result.current.reject.mutate('o2')
    result.current.ready.mutate('o4')
    result.current.complete.mutate('o6')
    result.current.noShow.mutate('o6')

    await waitFor(() => {
      expect(result.current.reject.isSuccess).toBe(true)
      expect(result.current.ready.isSuccess).toBe(true)
      expect(result.current.complete.isSuccess).toBe(true)
      expect(result.current.noShow.isSuccess).toBe(true)
    })
    expect(orderApi.rejectOrder).toHaveBeenCalledWith('o2')
    expect(orderApi.readyOrder).toHaveBeenCalledWith('o4')
    expect(orderApi.completeOrder).toHaveBeenCalledWith('o6')
    expect(orderApi.noShowOrder).toHaveBeenCalledWith('o6')
  })
})
