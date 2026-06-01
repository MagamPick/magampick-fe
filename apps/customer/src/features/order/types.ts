import { z } from 'zod'
import { cartItemSchema, pickupSchema } from '@/features/cart/types'

/**
 * 주문 도메인 타입 (노션: 주문 생성 · 주문 결제, Phase 5).
 * 결제 성공 = 주문접수(PENDING) 확정 + 픽업 코드 4자리 발급.
 * 백엔드 order 도메인 미구현 → 클라이언트 mock/stub 으로 생성(노션 "stub 우선").
 */

/** 결제 수단 — 토스페이 단일 (노션) */
export const paymentMethodSchema = z.literal('toss')
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

/** 금액 요약 — 정상가 합계 / 할인액 / 결제 예정(=결제) 금액 */
export const orderAmountsSchema = z.object({
  normalTotal: z.number(),
  discountTotal: z.number(),
  payTotal: z.number(),
})
export type OrderAmounts = z.infer<typeof orderAmountsSchema>

/** 주문 상태 — MVP 생성 시점은 주문접수(PENDING)만. 이후 전이는 사장 기능(별도 PR) */
export const orderStatusSchema = z.enum(['PENDING'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

/** 주문 — 장바구니 스냅샷 + 픽업/메모/금액 + 발급 코드 */
export const orderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  storeName: z.string(),
  items: z.array(cartItemSchema),
  pickup: pickupSchema,
  /** 픽업 요청 메모 (사장 전달용, ≤80자) */
  memo: z.string().max(80),
  amounts: orderAmountsSchema,
  /** 픽업 인증 코드 4자리 */
  pickupCode: z.string().regex(/^\d{4}$/),
  status: orderStatusSchema,
  paymentMethod: paymentMethodSchema,
  /** 생성 시각 (ISO) */
  createdAt: z.string(),
})
export type Order = z.infer<typeof orderSchema>
