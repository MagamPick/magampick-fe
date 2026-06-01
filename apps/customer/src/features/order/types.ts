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

/** 주문 상태 전체 (노션: 주문 상태 변경 상태 머신) */
export const orderStatusSchema = z.enum([
  'PENDING', // 주문접수 — 사장 수락 전
  'PREPARING', // 준비중
  'READY', // 준비완료
  'COMPLETED', // 수령완료(픽업 완료)
  'NO_SHOW', // 미수령
  'REJECTED', // 사장 거절
  'CANCELLED', // 소비자 취소
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

/** 소비자 뷰 상태 그룹 */
export const PICKUP_WAITING_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'READY']
export const DONE_STATUSES: OrderStatus[] = ['COMPLETED', 'NO_SHOW', 'REJECTED', 'CANCELLED']

/** 주문 — 장바구니 스냅샷 + 픽업/메모/금액 + 발급 코드 */
export const orderSchema = z.object({
  id: z.string(),
  /** 표시용 주문 번호 (예: "1024") */
  orderNo: z.string(),
  storeId: z.string(),
  storeName: z.string(),
  /** 매장 전화번호 (사장 수락 후 픽업 연락용) */
  storePhone: z.string().optional(),
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
  /** 완료/취소 처리 시각 (ISO) — DONE_STATUSES 에서 카드 날짜 표시용 */
  completedAt: z.string().optional(),
})
export type Order = z.infer<typeof orderSchema>
