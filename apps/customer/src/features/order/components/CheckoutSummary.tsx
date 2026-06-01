import { calcCartAmounts } from '@/features/cart/lib/calcCartAmounts'
import type { CartItem } from '@/features/cart/types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 결제 금액 요약 — 상품 금액 / 마감 할인 / 최종 결제 금액 (쿠폰·포인트는 Phase 8) */
export function CheckoutSummary({ items }: { items: CartItem[] }) {
  const { normalTotal, discountTotal, payTotal } = calcCartAmounts(items)

  return (
    <section className="mx-5 mt-4 rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-baseline justify-between py-[5px] text-[13.5px] text-muted-foreground">
        <span>상품 금액</span>
        <b className="font-extrabold text-foreground">{won(normalTotal)}</b>
      </div>
      <div className="flex items-baseline justify-between py-[5px] text-[13.5px] text-muted-foreground">
        <span>마감 할인</span>
        <b className="font-extrabold text-destructive">-{won(discountTotal)}</b>
      </div>
      <div className="my-2 h-px bg-border" />
      <div className="flex items-baseline justify-between py-[5px] text-sm font-bold text-foreground">
        <span>최종 결제 금액</span>
        <b className="text-[19px] font-extrabold text-primary">{won(payTotal)}</b>
      </div>
    </section>
  )
}
