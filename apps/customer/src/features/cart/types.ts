import { z } from 'zod'

/**
 * 장바구니 도메인 타입 (노션: 장바구니 관리, Phase 5).
 * 클라이언트 로컬 상태 — localStorage 영구 저장(서버 미저장), 단일 매장 정책.
 * 담는 시점에 상품 정보를 스냅샷으로 캡처(서버 재조회 없이 표시·금액 계산).
 */

/** 상품당 수량 범위 (노션 정책) */
export const CART_QTY_MIN = 1
export const CART_QTY_MAX = 10

/** 담긴 상품 종류 — 떨이(deal)/일반(menu). product-detail 의 ProductKind 와 동일 의미 */
export const cartItemKindSchema = z.enum(['deal', 'menu'])
export type CartItemKind = z.infer<typeof cartItemKindSchema>

/**
 * 장바구니 항목 — 담는 시점 스냅샷.
 * - menu(일반): salePrice = originalPrice = 정가
 * - deal(떨이): originalPrice = 원가, salePrice = 할인가
 */
export const cartItemSchema = z.object({
  id: z.string(),
  kind: cartItemKindSchema,
  name: z.string(),
  imageUrl: z.string().nullable(),
  /** 정상가(원가) */
  originalPrice: z.number(),
  /** 결제 단가 (deal=할인가, menu=정가) */
  salePrice: z.number(),
  qty: z.number().int().min(CART_QTY_MIN).max(CART_QTY_MAX),
})
export type CartItem = z.infer<typeof cartItemSchema>

/** 장바구니 매장 컨텍스트 — 단일 매장 정책. closingTime 은 픽업 슬롯 상한 */
export const cartStoreInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** 매장 마감 시각 (HH:mm) — 픽업 시간 슬롯 생성 상한 */
  closingTime: z.string(),
})
export type CartStoreInfo = z.infer<typeof cartStoreInfoSchema>

/** 픽업 시간 선택 — ASAP 또는 15분 단위 슬롯(HH:mm) */
export const pickupSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('asap') }),
  z.object({ type: z.literal('slot'), time: z.string() }),
])
export type Pickup = z.infer<typeof pickupSchema>

/** 금액 요약 — 정상가 합계 / 할인액(떨이 할인분) / 결제 예정액 */
export interface CartAmounts {
  /** 정상가 합계 */
  normalTotal: number
  /** 할인액 (떨이 할인분 합, 일반=0) */
  discountTotal: number
  /** 결제 예정액 = normalTotal - discountTotal */
  payTotal: number
}
