import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { usePointSummary } from '@/features/points/hooks/usePointSummary'
import { useCoupons } from '@/features/coupons/hooks/useCoupons'
import { calcCheckoutAmounts } from '../lib/calcCheckoutAmounts'
import { CheckoutSection } from '../components/CheckoutSection'
import { PickupInfoCard } from '../components/PickupInfoCard'
import { PickupMemo } from '../components/PickupMemo'
import { OrderSummaryList } from '../components/OrderSummaryList'
import { PayMethod } from '../components/PayMethod'
import { PayAgreement } from '../components/PayAgreement'
import { CheckoutSummary } from '../components/CheckoutSummary'
import { BenefitSection } from '../components/BenefitSection'
import { CouponPickerSheet } from '../components/CouponPickerSheet'
import { usePrepareAndPay } from '../hooks/usePrepareAndPay'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 결제 화면 (노션: 주문 결제 + 쿠폰 사용 + 포인트 사용, 프로토타입 41-checkout).
 * 픽업 정보·메모 → 주문 상품 → 혜택 적용(쿠폰·포인트) → 결제 수단 → 동의 → 금액.
 * 금액 계산 순서: 상품 → 쿠폰(일반 상품분) → 포인트(잔액 한도) → 최종(≥0). 동의해야 결제 가능.
 */
export function CheckoutPage() {
  const navigate = useNavigate()
  const store = useCartStore((s) => s.store)
  const items = useCartStore((s) => s.items)
  const pickup = useCartStore((s) => s.pickup)
  const [memo, setMemo] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null)
  const [pointInput, setPointInput] = useState(0)
  const [couponSheetOpen, setCouponSheetOpen] = useState(false)
  const prepareAndPay = usePrepareAndPay()

  const { data: pointSummary } = usePointSummary()
  const { data: coupons } = useCoupons()

  // 빈 장바구니 결제 진입 불가 (노션). 결제 성공 시엔 장바구니를 비우지 않고 완료 화면으로
  // 이동하므로(클리어는 OrderSuccessPage), 이동 전까지 이 가드가 오작동하지 않는다.
  if (!store || items.length === 0) return <Navigate to={ROUTES.CART} replace />

  const pointBalance = pointSummary?.balance ?? 0
  const selectedCoupon = coupons?.find((c) => c.id === selectedCouponId) ?? null
  const amounts = calcCheckoutAmounts({
    items,
    coupon: selectedCoupon,
    pointInput,
    pointBalance,
  })

  const handlePointChange = (value: number) =>
    setPointInput(Math.min(Math.max(0, value), amounts.pointCap))
  const handleUseAllPoints = () => setPointInput(amounts.pointCap)

  const orderPayload = {
    store: { id: store.id, name: store.name },
    items,
    pickup,
    memo,
    amounts: {
      normalTotal: amounts.normalTotal,
      discountTotal: amounts.dealDiscount,
      couponDiscount: amounts.couponDiscount,
      pointUsed: amounts.pointUsed,
      payTotal: amounts.payProductTotal,
      finalAmount: amounts.payTotal,
      earnedPoints: amounts.earnedPoints,
    },
    couponId: amounts.couponApplicable ? selectedCouponId : null,
    pointUsed: amounts.pointUsed,
  } as const

  const handlePay = () => {
    if (!agreed) return
    // 실 결제 경로: prepare(AWAITING_PAYMENT) → stash → 토스 결제창(리다이렉트)
    // → 리다이렉트 콜백(PaymentSuccessPage)에서 confirm 후 완료화면.
    if (prepareAndPay.isPending) return
    prepareAndPay.mutate(orderPayload)
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

        <BenefitSection
          selectedCoupon={selectedCoupon}
          couponApplicable={amounts.couponApplicable}
          couponDiscount={amounts.couponDiscount}
          onOpenCoupon={() => setCouponSheetOpen(true)}
          pointInput={pointInput}
          pointBalance={pointBalance}
          pointCap={amounts.pointCap}
          onPointChange={handlePointChange}
          onUseAllPoints={handleUseAllPoints}
        />

        <CheckoutSection title="결제 수단">
          <PayMethod />
        </CheckoutSection>

        <PayAgreement checked={agreed} onChange={setAgreed} />
        <CheckoutSummary amounts={amounts} />
      </main>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
        <Button
          type="button"
          disabled={!agreed || prepareAndPay.isPending}
          onClick={handlePay}
          className="h-[54px] w-full rounded-[12px] text-base font-bold"
        >
          {prepareAndPay.isPending ? '결제 중…' : `${won(amounts.payTotal)} 결제하기`}
        </Button>
      </div>

      <CouponPickerSheet
        open={couponSheetOpen}
        onOpenChange={setCouponSheetOpen}
        coupons={coupons ?? []}
        menuSubtotal={amounts.menuSubtotal}
        selectedCouponId={selectedCouponId}
        onSelect={setSelectedCouponId}
      />
    </ScreenContainer>
  )
}
