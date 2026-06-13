/**
 * 이벤트(쿠폰) 도메인 API — 실연동. AdminCouponController.
 * 참조 패턴: seller clearanceApi (apiClient + Zod 응답 검증).
 * 에러 정규화: apiClient interceptor(normalizeError) 처리. envelope unwrap 도 interceptor.
 * ⚠ 생성=value / 수정=discountValue (BE 필드명 불일치) — updateEvent 직렬화에서 매핑.
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { adminCouponResponseSchema } from '../types'
import type { EventCreatePayload, EventUpdatePayload, EventView } from '../types'

const couponListSchema = z.array(adminCouponResponseSchema)

export const eventApi = {
  /** GET /admin/coupons → AdminCouponResponse[] (생성 최신순) */
  async listEvents(): Promise<EventView[]> {
    const res = await apiClient.get('/admin/coupons')
    return couponListSchema.parse(res.data)
  },

  /** POST /admin/coupons → 201 AdminCouponResponse. 생성 요청 본문은 value 필드. */
  async createEvent(payload: EventCreatePayload): Promise<EventView> {
    const res = await apiClient.post('/admin/coupons', {
      label: payload.label,
      discountType: payload.discountType,
      value: payload.value,
      minOrder: payload.minOrder,
      validUntil: payload.validUntil,
      issueLimit: payload.issueLimit,
      displayStartAt: payload.displayStartAt,
      displayEndAt: payload.displayEndAt,
    })
    return adminCouponResponseSchema.parse(res.data)
  },

  /**
   * PATCH /admin/coupons/{couponId} → 200 AdminCouponResponse.
   * ⚠ 수정 요청 본문은 discountValue (생성의 value 와 이름 다름) — 누락 시 할인값 수정이 무반영.
   */
  async updateEvent(id: number, payload: EventUpdatePayload): Promise<EventView> {
    const res = await apiClient.patch(`/admin/coupons/${id}`, {
      label: payload.label,
      discountType: payload.discountType,
      discountValue: payload.value, // value → discountValue 매핑
      minOrder: payload.minOrder,
      validUntil: payload.validUntil,
      issueLimit: payload.issueLimit,
      displayStartAt: payload.displayStartAt,
      displayEndAt: payload.displayEndAt,
    })
    return adminCouponResponseSchema.parse(res.data)
  },

  /** POST /admin/coupons/{couponId}/end → 200 AdminCouponResponse (active=false, status=ended) */
  async endEvent(id: number): Promise<EventView> {
    const res = await apiClient.post(`/admin/coupons/${id}/end`)
    return adminCouponResponseSchema.parse(res.data)
  },
}
