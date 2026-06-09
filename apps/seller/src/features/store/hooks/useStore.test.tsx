import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStore } from './useStore'
import { storeApi } from '../api/storeApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { StoreDetail } from '../types'

vi.mock('../api/storeApi')

describe('useStore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('매장 상세 조회 성공 시 미리채움 상세를 반환한다', async () => {
    const detail: StoreDetail = {
      id: 1,
      storeName: '마감픽 베이커리 역삼점',
      storeAddress: '서울 강남구 역삼로 180',
      storeAddressDetail: '1층',
      storePhone: '02-501-1234',
      photoAdded: true,
    }
    vi.mocked(storeApi.getStore).mockResolvedValue(detail)

    const { result } = renderHook(() => useStore(1), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(detail)
    expect(storeApi.getStore).toHaveBeenCalledWith(1)
  })

  it('storeId 가 null 이면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHook(() => useStore(null), { wrapper: createQueryWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(storeApi.getStore).not.toHaveBeenCalled()
  })
})
