import { useMutation } from '@tanstack/react-query'
import { ROUTES } from '@/shared/lib/routes'
import type { CartItem, CartStoreInfo, Pickup } from '@/features/cart/types'
import type { OrderAmounts } from '../types'
import { orderApi } from '../api/orderApi'
import { requestTossPaymentSdk } from '../lib/tossPaymentSdk'
import { stashPaymentSession } from '../lib/paymentSession'

export interface PrepareAndPayVars {
  store: Pick<CartStoreInfo, 'id' | 'name'>
  items: CartItem[]
  pickup: Pickup
  memo: string
  amounts: OrderAmounts
  couponId?: number | null
  pointUsed?: number
}

/**
 * 실 결제 흐름: prepare(AWAITING_PAYMENT) → sessionStorage stash → 토스 SDK 결제창(리다이렉트).
 * 결제창은 리다이렉트 방식이라 onSuccess 는 호출되지 않음 — 결과는 PaymentSuccessPage 에서 confirm.
 * 오류(사용자 취소·네트워크 등) 시 onError 로 전달됨.
 *
 * VITE_USE_REAL_PAYMENT=true + VITE_TOSS_CLIENT_KEY 설정 필요.
 */
export function usePrepareAndPay() {
  return useMutation({
    mutationFn: async (vars: PrepareAndPayVars) => {
      // 1. 주문 준비 — AWAITING_PAYMENT 임시 생성
      const prepared = await orderApi.prepare({
        store: vars.store,
        items: vars.items,
        pickup: vars.pickup,
        memo: vars.memo,
        amounts: vars.amounts,
        couponId: vars.couponId,
        pointUsed: vars.pointUsed,
      })

      // 2. 리다이렉트 후 confirm 에 필요한 숫자 orderId · amount 를 sessionStorage 에 stash
      stashPaymentSession({ orderId: prepared.orderId, amount: prepared.amount })

      // 3. 토스 SDK 결제창 호출 (리다이렉트 → 이후 코드 실행 없음)
      await requestTossPaymentSdk({
        amount: prepared.amount,
        orderId: prepared.tossOrderId,
        orderName: prepared.orderName,
        successUrl: `${window.location.origin}${ROUTES.PAYMENT_SUCCESS}`,
        failUrl: `${window.location.origin}${ROUTES.PAYMENT_FAIL}`,
      })
    },
  })
}
