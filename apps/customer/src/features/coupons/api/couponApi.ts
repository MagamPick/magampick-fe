import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import {
  couponEventSchema,
  couponSchema,
  type Coupon,
  type CouponEvent,
} from '../types'

/**
 * 쿠폰 API — 실 BE 연동 (Phase 8).
 * GET /api/v1/customers/me/coupons — 보유 쿠폰 목록 (BE status 신뢰, 클라 만료 보정 없음)
 * GET /api/v1/customers/me/coupons/events — 이벤트 쿠폰 목록 (claimed 포함)
 * POST /api/v1/customers/me/coupons/events/{couponId}/claim — 쿠폰 받기 (201 CouponResponse)
 * 사용(차감)은 결제(POST /orders)에 통합됨 — use 함수 없음.
 */
export const couponApi = {
  /** 보유 쿠폰 — BE status(USABLE/USED/EXPIRED) 그대로 반환 */
  async listCoupons(): Promise<Coupon[]> {
    const { data } = await apiClient.get('/customers/me/coupons')
    return z.array(couponSchema).parse(data)
  },

  /** 받을 수 있는 이벤트 쿠폰 (claimed 여부 포함) */
  async listEvents(): Promise<CouponEvent[]> {
    const { data } = await apiClient.get('/customers/me/coupons/events')
    return z.array(couponEventSchema).parse(data)
  },

  /** 이벤트 쿠폰 받기 — 1인 1회, 쿠폰함에 USABLE 쿠폰으로 추가 */
  async claim(couponId: number): Promise<Coupon> {
    const { data } = await apiClient.post(`/customers/me/coupons/events/${couponId}/claim`)
    return couponSchema.parse(data)
  },
}
