import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { couponApi } from '@/features/coupons/api/couponApi'
import { couponKeys } from '@/features/coupons/hooks/couponKeys'
import { pointApi } from '@/features/points/api/pointApi'
import { pointKeys } from '@/features/points/hooks/pointKeys'
import { requestTossPayment } from '../lib/paymentStub'
import { orderApi, type CreateOrderInput } from '../api/orderApi'

/**
 * 결제 요청 변수 — paymentKey 는 결제 stub 이 채우므로 제외.
 * couponId/pointUsed 는 결제 성공 후 혜택 차감(mock)에 사용.
 */
export type CreateOrderVars = Omit<CreateOrderInput, 'paymentKey'> & {
  /** 사용 쿠폰 id (적용 시) — 결제 성공 후 used 처리 */
  couponId?: string | null
  /** 사용 포인트 (1P=1원) — 결제 성공 후 잔액 차감 */
  pointUsed?: number
}

/**
 * 결제 → 주문 생성 (노션: 결제 승인 성공 = 주문접수 확정 + 픽업 코드 발급 + 혜택 차감).
 * 토스 stub 승인 후 주문 mock 생성, 그 다음 쿠폰 used·포인트 차감(mock). 성공 시 완료 화면으로 이동.
 * 혜택 차감 실패는 주문 완료를 막지 않는다(best-effort). 성공 시 포인트·쿠폰 쿼리를 무효화한다.
 */
export function useCreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: CreateOrderVars) => {
      const { couponId, pointUsed, ...orderVars } = vars
      const payment = await requestTossPayment({
        amount: vars.amounts.payTotal,
        orderName: buildOrderName(vars.items),
      })
      if (!payment.approved) throw new Error('PAYMENT_FAILED')
      const order = await orderApi.create({ ...orderVars, paymentKey: payment.paymentKey })

      // 혜택 차감 (mock — 결제 성공 시점). 실패해도 주문 완료는 유지.
      try {
        if (couponId) await couponApi.use(couponId)
        if (pointUsed && pointUsed > 0) await pointApi.use(pointUsed, vars.store.name)
      } catch {
        // 차감 실패는 무시 — 무효화 후 재조회로 실제 상태 반영
      }
      return order
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
