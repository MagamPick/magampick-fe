import { classifyCouponStatus } from '../lib/couponCalc'
import {
  couponEventSchema,
  couponSchema,
  type Coupon,
  type CouponEvent,
} from '../types'

/**
 * ⚠️ Mock 스텁 — coupon BE 미구현. in-memory 보유 쿠폰 + 이벤트 (orderApi 패턴: 배열 + delay + Zod).
 * 발급 = 가입 축하 자동(pre-seed) + 이벤트 [받기](claim). 사용 = 결제 성공 시 used.
 * 소멸 = 만료일 경과 시 조회 시점 보정(classifyCouponStatus). 1주문 1쿠폰 적용은 결제 화면 로직.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 이벤트 + 받음 여부 (마이→이벤트 카드) */
export interface CouponEventView extends CouponEvent {
  claimed: boolean
}

const COUPONS: Coupon[] = []
const EVENTS: CouponEvent[] = []
const CLAIMED = new Set<string>() // 받은 이벤트 id (1인 1회)

function seedCoupon(c: Coupon) {
  COUPONS.push(couponSchema.parse(c))
}
function seedEvent(e: CouponEvent) {
  EVENTS.push(couponEventSchema.parse(e))
}

;(function initSeed() {
  // 가입 축하 쿠폰 = 회원가입 시 BE 자동 지급 → mock 은 쿠폰함에 pre-seed.
  seedCoupon({ id: 'cp1', status: 'usable', discountType: 'rate', value: 30, minOrder: 5000, label: '신규 가입 축하 쿠폰', expiresAt: '2026-06-30' })
  seedCoupon({ id: 'cp2', status: 'usable', discountType: 'amount', value: 2000, minOrder: 10000, label: '1만원 이상 2천원 할인', expiresAt: '2026-06-30' })
  seedCoupon({ id: 'cp3', status: 'usable', discountType: 'rate', value: 15, minOrder: 5000, label: '디저트 위크 15% 쿠폰', expiresAt: '2026-06-12' })
  seedCoupon({ id: 'cp4', status: 'used', discountType: 'rate', value: 20, minOrder: 5000, label: '주말 한정 20% 쿠폰', expiresAt: '2026-05-12' })
  seedCoupon({ id: 'cp5', status: 'used', discountType: 'amount', value: 1000, minOrder: 0, label: '첫 주문 1천원 할인', expiresAt: '2026-04-30' })
  // cp6: status usable 이지만 만료일 경과 → 조회 시 expired 로 보정(만료 탭).
  seedCoupon({ id: 'cp6', status: 'usable', discountType: 'rate', value: 10, minOrder: 3000, label: '봄맞이 10% 쿠폰', expiresAt: '2026-03-31' })

  // 이벤트(받을 수 있는 쿠폰)
  seedEvent({ id: 'ev1', discountType: 'rate', value: 30, minOrder: 5000, label: '신규 가입 축하 쿠폰', expiresAt: '2026-06-30' })
  seedEvent({ id: 'ev2', discountType: 'amount', value: 2000, minOrder: 10000, label: '1만원 이상 2천원 할인', expiresAt: '2026-06-30' })
  seedEvent({ id: 'ev3', discountType: 'rate', value: 15, minOrder: 5000, label: '디저트 위크 15% 쿠폰', expiresAt: '2026-06-12' })
  seedEvent({ id: 'ev4', discountType: 'rate', value: 20, minOrder: 5000, label: '주말 한정 20% 쿠폰', expiresAt: '2026-06-15' })
  seedEvent({ id: 'ev5', discountType: 'amount', value: 1000, minOrder: 0, label: '첫 주문 1천원 할인', expiresAt: '2026-07-31' })
})()

export const couponApi = {
  /** 보유 쿠폰 — 만료일 경과분은 expired 로 보정해 반환 */
  async listCoupons(now: Date = new Date()): Promise<Coupon[]> {
    await delay(250)
    return COUPONS.map((c) => ({ ...c, status: classifyCouponStatus(c, now) }))
  },

  /** 결제 시 쿠폰 사용 — usable → used */
  async use(id: string, now: Date = new Date()): Promise<Coupon> {
    await delay(250)
    const coupon = COUPONS.find((c) => c.id === id)
    if (!coupon) throw new Error('쿠폰을 찾을 수 없어요.')
    if (classifyCouponStatus(coupon, now) !== 'usable') throw new Error('사용할 수 없는 쿠폰이에요.')
    coupon.status = 'used'
    return { ...coupon }
  },

  /** 받을 수 있는 이벤트 쿠폰 (받음 여부 포함) */
  async listEvents(): Promise<CouponEventView[]> {
    await delay(250)
    return EVENTS.map((e) => ({ ...e, claimed: CLAIMED.has(e.id) }))
  },

  /** 이벤트 쿠폰 받기 — 1인 1회, 쿠폰함에 usable 추가 */
  async claim(eventId: string): Promise<Coupon> {
    await delay(300)
    const event = EVENTS.find((e) => e.id === eventId)
    if (!event) throw new Error('이벤트를 찾을 수 없어요.')
    if (CLAIMED.has(eventId)) throw new Error('이미 받은 쿠폰이에요.')
    CLAIMED.add(eventId)
    const coupon = couponSchema.parse({
      id: `cp_${eventId}_${Date.now()}`,
      status: 'usable',
      discountType: event.discountType,
      value: event.value,
      minOrder: event.minOrder,
      label: event.label,
      expiresAt: event.expiresAt,
    })
    COUPONS.push(coupon)
    return { ...coupon }
  },
}
