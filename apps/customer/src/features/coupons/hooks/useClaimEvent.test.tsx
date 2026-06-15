import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClaimEvent } from './useClaimEvent'
import { couponApi } from '../api/couponApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Coupon } from '../types'

vi.mock('../api/couponApi')

const claimed: Coupon = {
  id: 99,
  status: 'USABLE',
  discountType: 'RATE',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
}

describe('useClaimEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('couponId(number)로 쿠폰을 받는다', async () => {
    vi.mocked(couponApi.claim).mockResolvedValue(claimed)

    const { result } = renderHook(() => useClaimEvent(), { wrapper: createQueryWrapper() })
    result.current.mutate(10)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(couponApi.claim).toHaveBeenCalledWith(10)
  })
})
