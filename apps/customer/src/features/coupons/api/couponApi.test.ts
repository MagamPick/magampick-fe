import { describe, it, expect, vi, beforeEach } from 'vitest'
import { couponApi } from './couponApi'
import { apiClient } from '@/shared/lib/axios'
import type { Coupon, CouponEvent } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}))
const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: 1,
  status: 'USABLE',
  discountType: 'RATE',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
  ...over,
})

const event = (over: Partial<CouponEvent> = {}): CouponEvent => ({
  couponId: 1,
  discountType: 'RATE',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
  claimed: false,
  ...over,
})

describe('couponApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listCoupons — BE 응답을 Zod 검증해 반환(BE status 신뢰)', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        coupon({ id: 1, status: 'USABLE' }),
        coupon({ id: 2, status: 'USED' }),
        coupon({ id: 3, status: 'EXPIRED' }),
      ],
    })
    const list = await couponApi.listCoupons()
    expect(list).toHaveLength(3)
    expect(list[0].status).toBe('USABLE')
    expect(list[1].status).toBe('USED')
    expect(list[2].status).toBe('EXPIRED')
    expect(mockedGet).toHaveBeenCalledWith('/customers/me/coupons')
  })

  it('listCoupons — id는 number 타입', async () => {
    mockedGet.mockResolvedValueOnce({ data: [coupon({ id: 42 })] })
    const list = await couponApi.listCoupons()
    expect(typeof list[0].id).toBe('number')
    expect(list[0].id).toBe(42)
  })

  it('listEvents — claimed 필드 포함, couponId number', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        event({ couponId: 10, claimed: false }),
        event({ couponId: 20, claimed: true }),
      ],
    })
    const events = await couponApi.listEvents()
    expect(events).toHaveLength(2)
    expect(events[0].couponId).toBe(10)
    expect(events[0].claimed).toBe(false)
    expect(events[1].claimed).toBe(true)
    expect(mockedGet).toHaveBeenCalledWith('/customers/me/coupons/events')
  })

  it('claim — POST 엔드포인트 호출 후 CouponResponse Zod 검증', async () => {
    const newCoupon = coupon({ id: 99, status: 'USABLE', label: '새 쿠폰' })
    mockedPost.mockResolvedValueOnce({ data: newCoupon })
    const claimed = await couponApi.claim(10)
    expect(claimed.id).toBe(99)
    expect(claimed.status).toBe('USABLE')
    expect(mockedPost).toHaveBeenCalledWith('/customers/me/coupons/events/10/claim')
  })
})
