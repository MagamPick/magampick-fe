import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCreateOrder, type CreateOrderVars } from './useCreateOrder'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { ROUTES } from '@/shared/lib/routes'
import { couponApi } from '@/features/coupons/api/couponApi'
import { pointApi } from '@/features/points/api/pointApi'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

// 혜택 차감 api 는 mock — 결제 후 호출 여부만 검증 (주문 mock·결제 stub 은 실제 사용)
vi.mock('@/features/coupons/api/couponApi')
vi.mock('@/features/points/api/pointApi')

const vars: CreateOrderVars = {
  store: { id: 'st-1', name: '브레드샵' },
  items: [
    {
      id: 'd1',
      kind: 'deal',
      name: '떨이 빵',
      imageUrl: null,
      originalPrice: 10000,
      salePrice: 6000,
      qty: 1,
    },
  ],
  pickup: { type: 'asap' },
  memo: '',
  amounts: { normalTotal: 10000, discountTotal: 4000, payTotal: 6000 },
}

describe('useCreateOrder', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    useCartStore.setState({
      store: { id: 'st-1', name: '브레드샵', closingTime: '21:00' },
      items: vars.items,
      pickup: { type: 'asap' },
    })
  })

  it('결제_성공시_주문_생성하고_완료화면으로_이동', async () => {
    const { result } = renderHook(() => useCreateOrder(), { wrapper: createQueryWrapper() })

    result.current.mutate(vars)

    // 결제 stub(600ms) + 주문 mock(400ms) 합산 — 기본 1000ms 초과라 여유를 둔다
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled(), { timeout: 3000 })

    const [route, opts] = mockNavigate.mock.calls[0] as [
      string,
      { state: { order: { status: string; pickupCode: string } } },
    ]
    expect(route).toBe(ROUTES.ORDER_SUCCESS)
    expect(opts.state.order.status).toBe('PENDING')
    expect(opts.state.order.pickupCode).toMatch(/^\d{4}$/)
  })

  it('쿠폰·포인트 사용 시 결제 성공 후 차감 api 를 호출한다', async () => {
    vi.mocked(couponApi.use).mockResolvedValue({
      id: 'cp1',
      status: 'used',
      discountType: 'rate',
      value: 30,
      minOrder: 5000,
      label: '쿠폰',
      expiresAt: '2026-06-30',
    })
    vi.mocked(pointApi.use).mockResolvedValue({ balance: 1950 })

    const { result } = renderHook(() => useCreateOrder(), { wrapper: createQueryWrapper() })

    result.current.mutate({ ...vars, couponId: 'cp1', pointUsed: 500 })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled(), { timeout: 3000 })
    expect(couponApi.use).toHaveBeenCalledWith('cp1')
    expect(pointApi.use).toHaveBeenCalledWith(500, '브레드샵')
  })
})
