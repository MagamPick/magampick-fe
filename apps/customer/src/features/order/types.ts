import { z } from 'zod'
import { cartItemSchema, pickupSchema } from '@/features/cart/types'

/**
 * 주문 도메인 타입 (노션: 주문 생성 · 주문 결제, Phase 5).
 * 결제 성공 = 주문접수(PENDING) 확정 + 픽업 코드 4자리 발급.
 * BE order 도메인 실연동 — apiClient + Zod 응답 검증(orderApi), 결제는 Toss 결제창(always-real).
 */

/** 결제 수단 — 토스페이 단일 (노션) */
export const paymentMethodSchema = z.literal('toss')
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

/**
 * 금액 요약 — 정상가 합계 / 할인액 / 결제 금액.
 * 쿠폰·포인트·적립 예정은 Phase 8(혜택)에서 추가 — 옵셔널(기존 주문 seed/fixture 후방 호환,
 * 미지정 = 혜택 미적용 주문). 신규 결제는 calcCheckoutAmounts 로 전부 채워 저장.
 */
export const orderAmountsSchema = z.object({
  normalTotal: z.number(),
  discountTotal: z.number(),
  /** 쿠폰 할인액 (일반 상품분, Phase 8) */
  couponDiscount: z.number().optional(),
  /** 사용 포인트 (1P=1원, Phase 8) */
  pointUsed: z.number().optional(),
  payTotal: z.number(),
  /**
   * 실결제액 — 실제 토스 청구액(= payTotal − couponDiscount − pointUsed, ≥0). BE OrderResponse 가 제공(X1-BE).
   * 옵셔널: 형제 혜택 필드와 동일하게 기존 seed/fixture 후방 호환 — 미지정이면 표시단에서 payTotal 로 폴백(혜택 미적용 주문은 finalAmount==payTotal).
   */
  finalAmount: z.number().optional(),
  /** 적립 예정 포인트 — 픽업완료 시 적립(실결제액 1% floor, Phase 8) */
  earnedPoints: z.number().optional(),
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

/** 환불 정책 상수 (노션 「환불 요청」: 픽업 후 3일 이내·사유 필수·전액) */
export const REFUND_WINDOW_DAYS = 3
export const REFUND_REASON_MAX = 200

/**
 * 환불 상태 — 픽업 완료(COMPLETED) 주문에 얹히는 별도 라이프사이클.
 * 주문 7-상태 머신(orderStatusSchema)은 그대로 두고 환불은 sub-field 로 분리.
 */
export const refundStatusSchema = z.enum([
  'REQUESTED', // 환불 요청됨 — 사장 승인 대기
  'APPROVED', // 승인됨 — 전액 환불 완료
  'REJECTED', // 거부됨 — 사장 거부 사유
])
export type RefundStatus = z.infer<typeof refundStatusSchema>

/** 환불 정보 — 요청 시 생성, 승인/거부 시 갱신 (노션 「환불 요청」·「환불 승인/거부」) */
export const refundSchema = z.object({
  status: refundStatusSchema,
  /** 소비자 환불 사유 (필수) */
  reason: z.string(),
  /** 요청 시각 (ISO) — 사장 3일 자동승인 기한 계산 */
  requestedAt: z.string(),
  /** 사장 거부 사유 (REJECTED 시, 소비자에게 노출) */
  rejectReason: z.string().optional(),
  /** 승인/거부 처리 시각 (ISO) */
  resolvedAt: z.string().optional(),
})
export type Refund = z.infer<typeof refundSchema>

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
  /** 환불 정보 — 픽업 완료 후 수동 환불 요청 시 생성(노션 「환불 요청」). 미요청이면 없음 */
  refund: refundSchema.optional(),
})
export type Order = z.infer<typeof orderSchema>
