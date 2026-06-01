import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCancelOrder } from './useCancelOrder'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/orderApi')

describe('useCancelOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('취소 성공 시 목록·상세 쿼리를 무효화한다', async () => {
    const cancelledOrder = { id: 'o1', status: 'CANCELLED' } as never
    vi.mocked(orderApi.cancelOrder).mockResolvedValue(cancelledOrder)

    const { result } = renderHook(() => useCancelOrder('o1'), { wrapper: createQueryWrapper() })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderApi.cancelOrder).toHaveBeenCalledWith('o1')
  })

  it('PENDING 아닌 주문 취소 시 에러를 반환한다', async () => {
    vi.mocked(orderApi.cancelOrder).mockRejectedValue(
      new Error('사장님이 수락하기 전에만 취소할 수 있어요.'),
    )

    const { result } = renderHook(() => useCancelOrder('o2'), { wrapper: createQueryWrapper() })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
