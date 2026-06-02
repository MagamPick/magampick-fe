import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EventCard } from './EventCard'
import type { CouponEventView } from '../api/couponApi'

const event = (over: Partial<CouponEventView> = {}): CouponEventView => ({
  id: 'ev1',
  discountType: 'rate',
  value: 30,
  minOrder: 5000,
  label: '신규 가입 축하 쿠폰',
  expiresAt: '2026-06-30',
  claimed: false,
  ...over,
})

describe('EventCard', () => {
  it('받기 버튼 클릭 시 onClaim(eventId) 호출', async () => {
    const onClaim = vi.fn()
    render(<EventCard event={event()} onClaim={onClaim} />)
    const btn = screen.getByRole('button', { name: '쿠폰 받기' })
    expect(btn).toBeEnabled()
    await userEvent.click(btn)
    expect(onClaim).toHaveBeenCalledWith('ev1')
  })

  it('이미 받은 쿠폰은 "받기 완료" + 비활성', () => {
    render(<EventCard event={event({ claimed: true })} onClaim={() => {}} />)
    const btn = screen.getByRole('button', { name: '이미 받은 쿠폰' })
    expect(btn).toBeDisabled()
    expect(screen.getByText('받기 완료')).toBeInTheDocument()
  })
})
