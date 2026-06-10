import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { CouponBoxPage } from './CouponBoxPage'
import { couponApi } from '../api/couponApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Coupon } from '../types'

vi.mock('../api/couponApi')

const coupon = (over: Partial<Coupon>): Coupon => ({
  id: 1,
  status: 'USABLE',
  discountType: 'RATE',
  value: 30,
  minOrder: 5000,
  label: '쿠폰',
  expiresAt: '2026-06-30',
  ...over,
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/mypage/coupons']}>
      <CouponBoxPage />
    </MemoryRouter>,
    { wrapper: createQueryWrapper() },
  )
}

describe('CouponBoxPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('사용 가능(USABLE) 쿠폰을 기본 표시하고, 탭 전환 시 상태별로 필터한다', async () => {
    vi.mocked(couponApi.listCoupons).mockResolvedValue([
      coupon({ id: 1, status: 'USABLE', label: '쿠폰A' }),
      coupon({ id: 2, status: 'USED', label: '쿠폰B' }),
      coupon({ id: 3, status: 'EXPIRED', label: '쿠폰C' }),
    ])

    renderPage()

    expect(await screen.findByText('쿠폰A')).toBeInTheDocument()
    expect(screen.queryByText('쿠폰B')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: /사용 완료/ }))
    expect(await screen.findByText('쿠폰B')).toBeInTheDocument()
    expect(screen.queryByText('쿠폰A')).not.toBeInTheDocument()
  })

  it('해당 탭에 쿠폰이 없으면 빈 상태를 표시', async () => {
    vi.mocked(couponApi.listCoupons).mockResolvedValue([
      coupon({ id: 2, status: 'USED', label: '쿠폰B' }),
    ])

    renderPage()

    expect(await screen.findByText(/해당 쿠폰이 없어요/)).toBeInTheDocument()
  })
})
