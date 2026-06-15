import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'
import { couponConditionText, couponValueText, isCouponUsable } from '@/features/coupons/lib/couponCalc'
import type { Coupon } from '@/features/coupons/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 보유 쿠폰 전체 (USABLE 만 노출) */
  coupons: Coupon[]
  /** 일반 상품 합계 — 적용 가능 여부·최소주문 판정 기준 */
  menuSubtotal: number
  selectedCouponId: number | null
  onSelect: (couponId: number | null) => void
}

/**
 * 쿠폰 선택 시트 (노션 「쿠폰 사용」, 프로토타입 41-checkout 쿠폰 시트).
 * 1주문 1쿠폰. 일반 상품 금액에만 적용 — 최소주문 미달·전액 떨이면 비활성 + 사유.
 */
export function CouponPickerSheet({
  open,
  onOpenChange,
  coupons,
  menuSubtotal,
  selectedCouponId,
  onSelect,
}: Props) {
  const usable = coupons.filter((c) => c.status === 'USABLE')

  const choose = (id: number | null) => {
    onSelect(id)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">쿠폰 선택</SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed">
            1주문에 1장만 사용할 수 있어요. 일반 상품 금액에만 적용돼요(떨이 제외).
          </SheetDescription>
        </SheetHeader>

        <div className="flex max-h-[58vh] flex-col gap-2 overflow-y-auto px-4 pb-2">
          <button
            type="button"
            onClick={() => choose(null)}
            className={cn(
              'rounded-xl border px-4 py-3 text-left text-sm font-bold transition active:scale-[0.99]',
              selectedCouponId === null
                ? 'border-primary bg-secondary text-secondary-foreground'
                : 'border-border text-foreground',
            )}
          >
            쿠폰 사용 안 함
          </button>

          {usable.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              사용 가능한 쿠폰이 없어요.
            </p>
          )}

          {usable.map((coupon) => {
            const applicable = isCouponUsable(coupon, menuSubtotal)
            const reason =
              menuSubtotal <= 0
                ? '쿠폰 적용 가능한 일반 상품이 없어요'
                : `최소 주문 ${coupon.minOrder.toLocaleString('ko-KR')}원 이상 필요`
            const selected = coupon.id === selectedCouponId
            return (
              <button
                key={coupon.id}
                type="button"
                disabled={!applicable}
                onClick={() => choose(coupon.id)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition active:scale-[0.99]',
                  selected ? 'border-primary bg-secondary' : 'border-border',
                  !applicable && 'opacity-50',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-foreground">
                    {coupon.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {`${couponConditionText(coupon)} · ~ ${coupon.expiresAt}`}
                  </span>
                  {!applicable && (
                    <span className="mt-0.5 block text-xs font-semibold text-destructive">
                      {reason}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[15px] font-extrabold text-secondary-foreground">
                  {couponValueText(coupon)}
                </span>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
