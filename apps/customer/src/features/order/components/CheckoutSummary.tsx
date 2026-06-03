import type { CheckoutAmounts } from '../lib/calcCheckoutAmounts'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 결제 금액 요약 (프로토타입 41-checkout `.cart-summary`).
 * 상품 금액 / 마감 할인 / 쿠폰 할인 / 포인트 사용 / 최종 결제 금액 (값 > 0 인 혜택만 노출).
 */
export function CheckoutSummary({ amounts }: { amounts: CheckoutAmounts }) {
  return (
    <section className="mx-5 mt-4 rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-baseline justify-between py-[5px] text-[13.5px] text-muted-foreground">
        <span>상품 금액</span>
        <b className="font-extrabold text-foreground">{won(amounts.normalTotal)}</b>
      </div>
      {amounts.dealDiscount > 0 && (
        <div className="flex items-baseline justify-between py-[5px] text-[13.5px] text-muted-foreground">
          <span>마감 할인</span>
          <b className="font-extrabold text-destructive">{`-${won(amounts.dealDiscount)}`}</b>
        </div>
      )}
      {amounts.couponDiscount > 0 && (
        <div className="flex items-baseline justify-between py-[5px] text-[13.5px] text-muted-foreground">
          <span>쿠폰 할인</span>
          <b className="font-extrabold text-destructive">{`-${won(amounts.couponDiscount)}`}</b>
        </div>
      )}
      {amounts.pointUsed > 0 && (
        <div className="flex items-baseline justify-between py-[5px] text-[13.5px] text-muted-foreground">
          <span>포인트 사용</span>
          <b className="font-extrabold text-destructive">{`-${won(amounts.pointUsed)}`}</b>
        </div>
      )}
      <div className="my-2 h-px bg-border" />
      <div className="flex items-baseline justify-between py-[5px] text-sm font-bold text-foreground">
        <span>최종 결제 금액</span>
        <b className="text-[19px] font-extrabold text-primary">{won(amounts.payTotal)}</b>
      </div>
    </section>
  )
}
