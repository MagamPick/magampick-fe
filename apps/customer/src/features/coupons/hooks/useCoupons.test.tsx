import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCoupons } from './useCoupons'
import { couponApi } from '../api/couponApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/couponApi')

describe('useCoupons', () => {
  beforeEach(() => vi.clearAllMocks())

  it('보유 쿠폰 목록을 조회한다', async () => {
    vi.mocked(couponApi.listCoupons).mockResolvedValue([])

    const { result } = renderHook(() => useCoupons(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(couponApi.listCoupons).toHaveBeenCalledOnce()
  })
})
