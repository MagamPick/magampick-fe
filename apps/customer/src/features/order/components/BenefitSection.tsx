import { ChevronRight, Ticket, Wallet } from 'lucide-react'
import { couponValueText } from '@/features/coupons/lib/couponCalc'
import type { Coupon } from '@/features/coupons/types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

interface Props {
  selectedCoupon: Coupon | null
  couponApplicable: boolean
  couponDiscount: number
  onOpenCoupon: () => void
  pointInput: number
  pointBalance: number
  pointCap: number
  onPointChange: (value: number) => void
  onUseAllPoints: () => void
}

/**
 * 결제 혜택 적용 (노션 「쿠폰 사용」·「포인트 사용」, 프로토타입 41-checkout `.bn-card`).
 * 쿠폰 선택 행(시트 열기) + 포인트 입력 행(모두 사용) + 보유 포인트 안내.
 */
export function BenefitSection({
  selectedCoupon,
  couponApplicable,
  couponDiscount,
  onOpenCoupon,
  pointInput,
  pointBalance,
  pointCap,
  onPointChange,
  onUseAllPoints,
}: Props) {
  const couponSummary =
    selectedCoupon && couponApplicable
      ? `${couponValueText(selectedCoupon)} · -${won(couponDiscount)}`
      : '선택 안 함'

  return (
    <section className="mx-5 mt-3 overflow-hidden rounded-[14px] border border-border bg-card">
      <h2 className="px-4 pb-1 pt-[14px] text-sm font-extrabold text-foreground">혜택 적용</h2>
      <button
        type="button"
        onClick={onOpenCoupon}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <Ticket aria-hidden className="size-[18px] shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">쿠폰</span>
        <span className="ml-auto truncate text-[13px] font-medium text-muted-foreground">
          {couponSummary}
        </span>
        <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" />
      </button>

      <div className="mx-4 h-px bg-border" />

      <div className="flex items-center gap-2 px-4 py-3.5">
        <Wallet aria-hidden className="size-[18px] shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">포인트</span>
        <span className="ml-auto flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            aria-label="사용 포인트"
            maxLength={7}
            placeholder="0"
            value={pointInput === 0 ? '' : String(pointInput)}
            onChange={(e) => onPointChange(Number(e.target.value.replace(/[^\d]/g, '')) || 0)}
            className="w-24 rounded-md border border-border bg-card px-2 py-1.5 text-right text-sm font-bold text-foreground outline-none focus:border-primary"
          />
          <span className="text-sm text-muted-foreground">원</span>
        </span>
        <button
          type="button"
          onClick={onUseAllPoints}
          disabled={pointCap <= 0}
          className="ml-2 shrink-0 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-bold text-secondary-foreground transition active:scale-[0.97] disabled:opacity-50"
        >
          모두 사용
        </button>
      </div>

      <p className="px-4 pb-3 text-xs text-muted-foreground">
        보유 포인트 <b className="font-bold text-foreground">{won(pointBalance)}</b>
      </p>
    </section>
  )
}
