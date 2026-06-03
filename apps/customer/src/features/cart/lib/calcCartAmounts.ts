import type { CartAmounts, CartItem } from '../types'

/**
 * 장바구니 금액 계산 (노션: 정상가 합계 / 할인액 / 결제 예정액).
 * - normalTotal = Σ 원가 × 수량
 * - payTotal    = Σ 결제단가 × 수량  (deal=할인가, menu=정가)
 * - discountTotal = normalTotal − payTotal  (떨이 할인분; 일반은 0)
 */
export function calcCartAmounts(items: CartItem[]): CartAmounts {
  let normalTotal = 0
  let payTotal = 0
  for (const item of items) {
    normalTotal += item.originalPrice * item.qty
    payTotal += item.salePrice * item.qty
  }
  return { normalTotal, discountTotal: normalTotal - payTotal, payTotal }
}
