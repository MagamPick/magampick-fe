import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { pickupLabel } from '../lib/pickupLabel'
import type { Order } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 주문 완료 (노션: 결제 성공 → 주문접수 + 픽업 코드, 프로토타입 42-order-success).
 * 주문은 결제 화면에서 navigate state 로 전달. 직접 진입(state 없음)이면 홈으로.
 */
export function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearCart = useCartStore((s) => s.clearCart)
  const order = (location.state as { order?: Order } | null)?.order

  // 주문 확정 화면 진입 = 결제 완료 → 장바구니 비우기.
  // (결제 화면이 빈 장바구니로 리렌더되며 되돌려지는 레이스를 피하려 여기서 처리)
  useEffect(() => {
    if (order) clearCart()
  }, [order, clearCart])

  if (!order) return <Navigate to={ROUTES.HOME} replace />

  return (
    <ScreenContainer variant="page">
      <main className="flex-1 px-5 pb-[calc(76px+env(safe-area-inset-bottom,24px)+16px)] text-center">
        <div className="mx-auto mt-[50px] flex size-[88px] items-center justify-center rounded-full bg-gradient-to-b from-[#3DD15B] to-[#22A341] text-white shadow-[0_14px_30px_rgba(34,163,65,0.28)]">
          <Check className="size-11" strokeWidth={3} aria-hidden />
        </div>
        <h1 className="mt-[22px] text-[22px] font-extrabold tracking-[-0.5px]">주문이 완료되었어요</h1>
        <p className="mt-3 text-sm leading-[1.65] text-muted-foreground">
          매장에서 아래 픽업 코드를 보여주시면
          <br />
          바로 받을 수 있어요.
        </p>

        <div className="mt-7 rounded-[18px] bg-gradient-to-b from-secondary to-[#FFD9C7] px-4 py-[22px]">
          <p className="text-xs font-extrabold text-secondary-foreground">픽업 인증 코드</p>
          <p className="mt-2.5 text-[40px] font-extrabold tracking-[10px] text-secondary-foreground tabular-nums">
            {order.pickupCode}
          </p>
          <p className="mt-2 text-[11.5px] font-semibold text-[#b5764e]">매장 직원에게 보여주세요</p>
        </div>

        <div className="mt-[22px] rounded-[14px] border border-border bg-card px-[18px] py-4 text-left">
          <InfoRow label="매장" value={order.storeName} />
          <InfoRow label="픽업 시간" value={pickupLabel(order.pickup)} highlight />
          <InfoRow label="결제 금액" value={won(order.amounts.payTotal)} />
          <InfoRow label="결제 수단" value="토스페이" />
        </div>

        <div className="mt-[18px] rounded-[11px] bg-[#fff6e5] px-[14px] py-[13px] text-left text-[12.5px] leading-[1.6] text-[#8b5a00]">
          <b className="font-extrabold text-[#b07a00]">⚠️ 매장 마감 전까지 픽업해 주세요.</b>
          <br />
          픽업 시간이 지나도 주문은 유지되지만, 끝내 찾아가지 못하면 환불이 제한될 수 있어요.
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 gap-2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
          className="h-[54px] flex-1 rounded-[12px] text-base font-bold"
        >
          홈으로
        </Button>
        <Button
          type="button"
          onClick={() => navigate(ROUTES.ORDERS, { replace: true })}
          className="h-[54px] flex-1 rounded-[12px] text-base font-bold"
        >
          주문 내역 보기
        </Button>
      </div>
    </ScreenContainer>
  )
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex gap-2.5 py-[7px] text-[13px]">
      <span className="w-[70px] flex-shrink-0 font-semibold text-muted-foreground">{label}</span>
      <span className={cn('font-bold text-foreground', highlight && 'font-extrabold text-primary')}>
        {value}
      </span>
    </div>
  )
}
