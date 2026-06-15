import { describe, it, expect } from 'vitest'
import { resolveNotificationLink } from './resolveNotificationLink'
import { ROUTES } from '@/shared/lib/routes'

describe('resolveNotificationLink (하이브리드: link 우선 → category fallback)', () => {
  it('내부 절대경로 link 가 있으면 그대로 반환 (건별 딥링크)', () => {
    expect(resolveNotificationLink({ category: 'order', link: '/orders/123' })).toBe('/orders/123')
  })

  it('link 가 category fallback 보다 우선 — category=benefit 라도 link 의 /mypage/points 로', () => {
    expect(resolveNotificationLink({ category: 'benefit', link: '/mypage/points' })).toBe(
      '/mypage/points',
    )
  })

  it('link 이 null 이면 category 로 fallback', () => {
    expect(resolveNotificationLink({ category: 'order', link: null })).toBe(ROUTES.ORDERS)
  })

  it('link 이 undefined 이면 category 로 fallback', () => {
    expect(resolveNotificationLink({ category: 'benefit', link: undefined })).toBe(ROUTES.COUPONS)
  })

  it('link 이 빈 문자열이면 category 로 fallback', () => {
    expect(resolveNotificationLink({ category: 'review', link: '' })).toBe(ROUTES.MY_REVIEWS)
  })

  it('외부 URL link 은 무시하고 category 로 fallback (앱 내부 경로만 신뢰)', () => {
    expect(resolveNotificationLink({ category: 'notice', link: 'https://evil.example/x' })).toBe(
      ROUTES.NOTICES,
    )
  })

  it("'/' 로 시작하지 않는 link 은 무시하고 category 로 fallback", () => {
    expect(resolveNotificationLink({ category: 'inquiry', link: 'support/inquiry/9' })).toBe(
      ROUTES.SUPPORT,
    )
  })

  it('link 이 있으면 category 가 라우트 없는 system 이어도 link 우선', () => {
    expect(resolveNotificationLink({ category: 'system', link: '/orders/7' })).toBe('/orders/7')
  })

  it('link 없고 category 도 라우트 없으면(system) null', () => {
    expect(resolveNotificationLink({ category: 'system', link: null })).toBeNull()
  })
})
