import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { requestTossPayment } from '../lib/paymentStub'
import { orderApi, type CreateOrderInput } from '../api/orderApi'

/** 결제 요청 변수 — paymentKey 는 결제 stub 이 채우므로 제외 */
export type CreateOrderVars = Omit<CreateOrderInput, 'paymentKey'>

/**
 * 결제 → 주문 생성 (노션: 결제 승인 성공 = 주문접수 확정 + 픽업 코드 발급).
 * 토스 stub 승인 후 주문 mock 생성. 성공 시 완료 화면으로 이동(주문은 navigate state 로 전달).
 * 장바구니 비우기는 완료 화면(OrderSuccessPage) 진입 시 처리 — 결제 화면이 빈 장바구니로
 * 리렌더되며 되돌려지는 레이스를 피한다.
 */
export function useCreateOrder() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (vars: CreateOrderVars) => {
      const payment = await requestTossPayment({
        amount: vars.amounts.payTotal,
        orderName: buildOrderName(vars.items),
      })
      if (!payment.approved) throw new Error('PAYMENT_FAILED')
      return orderApi.create({ ...vars, paymentKey: payment.paymentKey })
    },
    onSuccess: (order) => {
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
