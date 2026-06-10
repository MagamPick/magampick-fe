import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CouponPickerSheet } from './CouponPickerSheet'
import type { Coupon } from '@/features/coupons/types'

const coupon = (over: Partial<Coupon>): Coupon => ({
  id: 1,
  status: 'USABLE',
  discountType: 'RATE',
  value: 30,
  minOrder: 5000,
  label: '쿠폰',
  expiresAt: '2026-12-31',
  ...over,
})

describe('CouponPickerSheet', () => {
  it('적용 가능한 쿠폰 선택 시 onSelect(number id)', async () => {
    const onSelect = vi.fn()
    render(
      <CouponPickerSheet
        open
        onOpenChange={() => {}}
        coupons={[coupon({ id: 1, label: '30% 쿠폰', minOrder: 5000 })]}
        menuSubtotal={6000}
        selectedCouponId={null}
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByText('30% 쿠폰'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('최소주문 미달 쿠폰은 사유와 함께 비활성', () => {
    render(
      <CouponPickerSheet
        open
        onOpenChange={() => {}}
        coupons={[coupon({ id: 2, label: '1만원 쿠폰', minOrder: 10000 })]}
        menuSubtotal={6000}
        selectedCouponId={null}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByText(/최소 주문 10,000원 이상 필요/)).toBeInTheDocument()
  })

  it('"쿠폰 사용 안 함" 선택 시 onSelect(null)', async () => {
    const onSelect = vi.fn()
    render(
      <CouponPickerSheet
        open
        onOpenChange={() => {}}
        coupons={[]}
        menuSubtotal={6000}
        selectedCouponId={1}
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByText('쿠폰 사용 안 함'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
