import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrder } from './useOrder'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/orderApi')

describe('useOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('id가 있으면 주문 단건을 조회한다', async () => {
    const order = { id: 'o1', storeName: '테스트 매장' } as never
    vi.mocked(orderApi.getOrder).mockResolvedValue(order)

    const { result } = renderHook(() => useOrder('o1'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderApi.getOrder).toHaveBeenCalledWith('o1')
  })

  it('id가 빈 문자열이면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHook(() => useOrder(''), { wrapper: createQueryWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(orderApi.getOrder).not.toHaveBeenCalled()
  })
})
