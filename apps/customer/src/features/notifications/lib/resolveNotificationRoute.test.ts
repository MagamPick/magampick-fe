import { describe, it, expect } from 'vitest'
import { resolveNotificationRoute } from '../constants'
import { ROUTES } from '@/shared/lib/routes'

describe('resolveNotificationRoute', () => {
  it('deal → 홈(/)', () => {
    expect(resolveNotificationRoute('deal')).toBe(ROUTES.HOME)
  })

  it('order → 주문(/orders)', () => {
    expect(resolveNotificationRoute('order')).toBe(ROUTES.ORDERS)
  })

  it('refund → 주문(/orders) — 환불도 주문 화면', () => {
    expect(resolveNotificationRoute('refund')).toBe(ROUTES.ORDERS)
  })

  it('review → 내 리뷰(/reviews/my)', () => {
    expect(resolveNotificationRoute('review')).toBe(ROUTES.MY_REVIEWS)
  })

  it('benefit → 쿠폰함(/mypage/coupons)', () => {
    expect(resolveNotificationRoute('benefit')).toBe(ROUTES.COUPONS)
  })

  it('notice → 공지사항(/notices)', () => {
    expect(resolveNotificationRoute('notice')).toBe(ROUTES.NOTICES)
  })

  it('inquiry → 고객센터(/support)', () => {
    expect(resolveNotificationRoute('inquiry')).toBe(ROUTES.SUPPORT)
  })

  it('system → null (별도 화면 없음)', () => {
    expect(resolveNotificationRoute('system')).toBeNull()
  })

  it('settlement → null (별도 화면 없음)', () => {
    expect(resolveNotificationRoute('settlement')).toBeNull()
  })
})
