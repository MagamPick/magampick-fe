import type { ProductDetail } from '../types'

/** 장바구니 담기 가능 여부 + 차단 사유(불가 시) */
export type PurchaseState = { purchasable: true } | { purchasable: false; reason: string }

/**
 * 장바구니 담기 가능 여부를 계산한다.
 * 우선순위: 매장 영업 외 → 상품 자체 차단(일반 판매 OFF / 떨이 마감).
 * (장바구니 화면·실제 담기는 Phase 5 — 본 함수는 버튼 활성/사유 라벨만 결정)
 */
export function getPurchaseState(product: ProductDetail, nowMs: number): PurchaseState {
  // 매장 영업 외 (BREAK / CLOSED_TODAY) — 상품 상태보다 우선
  if (product.businessStatus !== 'OPEN') {
    return { purchasable: false, reason: '지금은 주문할 수 없는 매장이에요.' }
  }

  // 일반 상품 — 판매 여부 OFF 또는 활성 떨이 존재 시 차단
  if (product.kind === 'menu') {
    if (!product.isOnSale) {
      return { purchasable: false, reason: '현재 판매하지 않는 상품이에요.' }
    }
    if (product.hasActiveDeal) {
      return { purchasable: false, reason: '현재 떨이 판매 중인 상품입니다.' }
    }
    return { purchasable: true }
  }

  // 떨이 — 마감 상태 / 픽업 시각 경과 / 재고 소진이면 차단
  const expired = new Date(product.pickupDeadline).getTime() <= nowMs
  if (product.dealStatus !== 'ACTIVE' || expired || product.stockLeft <= 0) {
    return { purchasable: false, reason: '마감된 상품이에요.' }
  }
  return { purchasable: true }
}
