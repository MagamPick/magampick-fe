import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CouponCard } from './CouponCard'
import type { Coupon } from '../types'

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: 'cp1',
  status: 'usable',
  discountType: 'rate',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
  ...over,
})

describe('CouponCard', () => {
  it('정률 할인값·라벨·조건·만료일을 표시', () => {
    render(<CouponCard coupon={coupon()} />)
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('신규 가입 축하 쿠폰')).toBeInTheDocument()
    expect(screen.getByText('최소 주문 5,000원')).toBeInTheDocument()
    expect(screen.getByText('~ 2026-06-30')).toBeInTheDocument()
  })

  it('정액 할인값을 표시', () => {
    render(<CouponCard coupon={coupon({ discountType: 'amount', value: 2000 })} />)
    expect(screen.getByText('2,000원')).toBeInTheDocument()
  })

  it('최소주문 없으면 "최소 주문 없음"', () => {
    render(<CouponCard coupon={coupon({ minOrder: 0 })} />)
    expect(screen.getByText('최소 주문 없음')).toBeInTheDocument()
  })

  it('사용 완료 / 만료 상태 태그', () => {
    const { rerender } = render(<CouponCard coupon={coupon({ status: 'used' })} />)
    expect(screen.getByText('사용 완료')).toBeInTheDocument()
    rerender(<CouponCard coupon={coupon({ status: 'expired' })} />)
    expect(screen.getByText('만료')).toBeInTheDocument()
  })
})
