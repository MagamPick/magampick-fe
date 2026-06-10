import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { couponKeys } from '@/features/coupons/hooks/couponKeys'
import { pointKeys } from '@/features/points/hooks/pointKeys'
import { requestTossPayment } from '../lib/paymentStub'
import { orderApi, type CreateOrderInput } from '../api/orderApi'

/**
 * 결제 요청 변수 — paymentKey 는 결제 stub 이 채우므로 제외.
 * couponId/pointUsed 는 결제 성공 후 캐시 무효화에 사용.
 * 실 BE 연동 후 차감(쿠폰 used·포인트 잔액 감소)은 결제(POST /orders)에 통합돼 있어
 * 별도 use API 호출 없음 — 성공 시 무효화로 최신 상태 재조회.
 */
export type CreateOrderVars = Omit<CreateOrderInput, 'paymentKey'> & {
  /** 사용 쿠폰 number id (적용 시) */
  couponId?: number | null
  /** 사용 포인트 (1P=1원) */
  pointUsed?: number
}

/**
 * 결제 → 주문 생성 (노션: 결제 승인 성공 = 주문접수 확정 + 픽업 코드 발급 + 혜택 차감).
 * 토스 stub 승인 후 주문 mock 생성. 성공 시 포인트·쿠폰 쿼리를 무효화해 최신 상태 반영.
 */
export function useCreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: CreateOrderVars) => {
      const payment = await requestTossPayment({
        amount: vars.amounts.payTotal,
        orderName: buildOrderName(vars.items),
      })
      if (!payment.approved) throw new Error('PAYMENT_FAILED')
      // couponId/pointUsed 는 결제(orderApi.create) 에 미전달 — 차감은 결제에 통합.
      const orderInput: Omit<CreateOrderInput, 'paymentKey'> = {
        store: vars.store,
        items: vars.items,
        pickup: vars.pickup,
        memo: vars.memo,
        amounts: vars.amounts,
      }
      return orderApi.create({ ...orderInput, paymentKey: payment.paymentKey })
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all })
      queryClient.invalidateQueries({ queryKey: couponKeys.all })
      navigate(ROUTES.ORDER_SUCCESS, { state: { order } })
    },
  })
}

/** 결제창 표시용 주문명 — "{대표상품} 외 N건" */
function buildOrderName(items: CreateOrderVars['items']): string {
  if (items.length === 0) return '주문'
  const [first] = items
  return items.length > 1 ? `${first.name} 외 ${items.length - 1}건` : first.name
}
