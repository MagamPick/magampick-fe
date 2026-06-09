import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStoreStatus } from './useStoreStatus'
import { storeApi } from '../api/storeApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { StoreStatus } from '../types'

vi.mock('../api/storeApi')

describe('useStoreStatus', () => {
  beforeEach(() => vi.clearAllMocks())

  it('영업 상태 조회 성공 시 StoreStatus 를 반환한다', async () => {
    const status: StoreStatus = {
      storeId: 1,
      operationStatus: 'OPEN',
      canOpenToday: true,
      todayCloseTime: '21:00',
    }
    vi.mocked(storeApi.getStoreStatus).mockResolvedValue(status)

    const { result } = renderHook(() => useStoreStatus(1), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(status)
    expect(storeApi.getStoreStatus).toHaveBeenCalledWith(1)
  })

  it('storeId 가 null 이면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHook(() => useStoreStatus(null), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(storeApi.getStoreStatus).not.toHaveBeenCalled()
  })
})
