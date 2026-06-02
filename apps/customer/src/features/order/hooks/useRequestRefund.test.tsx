import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRequestRefund } from './useRequestRefund'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/orderApi')

describe('useRequestRefund', () => {
  beforeEach(() => vi.clearAllMocks())

  it('환불 요청 성공 시 사유를 전달하고 성공 상태가 된다', async () => {
    vi.mocked(orderApi.requestRefund).mockResolvedValue({
      id: 'o_s4',
      refund: { status: 'REQUESTED', reason: '상품 상태가 안 좋아요', requestedAt: 'now' },
    } as never)

    const { result } = renderHook(() => useRequestRefund('o_s4'), {
      wrapper: createQueryWrapper(),
    })

    act(() => {
      result.current.mutate('상품 상태가 안 좋아요')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderApi.requestRefund).toHaveBeenCalledWith('o_s4', '상품 상태가 안 좋아요')
  })

  it('이미 요청된 주문 등 실패 시 에러를 반환한다', async () => {
    vi.mocked(orderApi.requestRefund).mockRejectedValue(new Error('이미 환불을 요청한 주문이에요.'))

    const { result } = renderHook(() => useRequestRefund('o_s6'), {
      wrapper: createQueryWrapper(),
    })

    act(() => {
      result.current.mutate('또 요청')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
