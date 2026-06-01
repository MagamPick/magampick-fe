import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { calcCartAmounts } from '@/features/cart/lib/calcCartAmounts'
import { CheckoutSection } from '../components/CheckoutSection'
import { PickupInfoCard } from '../components/PickupInfoCard'
import { PickupMemo } from '../components/PickupMemo'
import { OrderSummaryList } from '../components/OrderSummaryList'
import { PayMethod } from '../components/PayMethod'
import { PayAgreement } from '../components/PayAgreement'
import { CheckoutSummary } from '../components/CheckoutSummary'
import { useCreateOrder } from '../hooks/useCreateOrder'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 결제 화면 (노션: 주문 생성 + 주문 결제, 프로토타입 41-checkout).
 * 픽업 정보·메모 → 주문 상품 → 결제 수단(토스) → 동의 → 금액. 동의해야 결제 가능.
 * 결제(stub 승인) 성공 시 주문접수 확정 + 완료 화면. 빈 장바구니면 장바구니로 되돌림.
 */
export function CheckoutPage() {
  const navigate = useNavigate()
  const store = useCartStore((s) => s.store)
  const items = useCartStore((s) => s.items)
  const pickup = useCartStore((s) => s.pickup)
  const [memo, setMemo] = useState('')
  const [agreed, setAgreed] = useState(false)
  const createOrder = useCreateOrder()

  // 빈 장바구니 결제 진입 불가 (노션). 결제 성공 시엔 장바구니를 비우지 않고 완료 화면으로
  // 이동하므로(클리어는 OrderSuccessPage), 이동 전까지 이 가드가 오작동하지 않는다.
  if (!store || items.length === 0) return <Navigate to={ROUTES.CART} replace />

  const amounts = calcCartAmounts(items)

  const handlePay = () => {
    if (!agreed || createOrder.isPending) return
    createOrder.mutate({ store: { id: store.id, name: store.name }, items, pickup, memo, amounts })
  }

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">결제</h1>
      </header>

      <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom,24px)+16px)]">
        <CheckoutSection
          title="픽업 정보"
          action={
            <button
              type="button"
              onClick={() => navigate(ROUTES.CART)}
              className="min-h-11 px-1 text-xs font-bold text-primary"
            >
              변경
            </button>
          }
        >
          <PickupInfoCard storeName={store.name} pickup={pickup} />
          <PickupMemo value={memo} onChange={setMemo} />
        </CheckoutSection>

        <CheckoutSection
          title={
            <>
              주문 상품
              <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
                {items.length}개
              </span>
            </>
          }
        >
          <OrderSummaryList items={items} />
        </CheckoutSection>

        <CheckoutSection title="결제 수단">
          <PayMethod />
        </CheckoutSection>

        <PayAgreement checked={agreed} onChange={setAgreed} />
        <CheckoutSummary items={items} />
      </main>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
        <Button
          type="button"
          disabled={!agreed || createOrder.isPending}
          onClick={handlePay}
          className="h-[54px] w-full rounded-[12px] text-base font-bold"
        >
          {createOrder.isPending ? '결제 중…' : `${won(amounts.payTotal)} 결제하기`}
        </Button>
      </div>
    </ScreenContainer>
  )
}
