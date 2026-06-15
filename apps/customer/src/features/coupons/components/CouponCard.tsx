import { cn } from '@/shared/lib/utils'
import { couponConditionText, couponValueText } from '../lib/couponCalc'
import type { Coupon } from '../types'

/** 쿠폰 카드 (프로토타입 `.cp-card`) — 좌측 할인값 + 라벨·조건·만료·상태 */
export function CouponCard({ coupon }: { coupon: Coupon }) {
  const dim = coupon.status !== 'USABLE'
  return (
    <div
      className={cn(
        'flex min-h-[84px] items-stretch overflow-hidden rounded-[14px] border-[1.5px] border-border bg-card',
        dim && 'opacity-55',
      )}
    >
      <div
        className={cn(
          'flex flex-[0_0_96px] flex-col items-center justify-center gap-1 border-r-[1.5px] border-dashed border-border px-1.5 py-2.5 text-center font-extrabold',
          dim ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground',
        )}
      >
        <div className="whitespace-nowrap text-lg leading-[1.1] tracking-[-0.4px]">
          {couponValueText(coupon)}
        </div>
        <div
          className={cn(
            'rounded-sm px-[7px] py-0.5 text-[11px] font-bold',
            dim ? 'bg-card' : 'bg-white/55',
          )}
        >
          할인
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3">
        <div className="text-sm font-bold text-foreground">{coupon.label}</div>
        <div className="text-xs text-muted-foreground">{couponConditionText(coupon)}</div>
        <div className="mt-auto flex items-center justify-between text-[11.5px] text-muted-foreground">
          <span className="font-semibold">{`~ ${coupon.expiresAt}`}</span>
          {coupon.status === 'USED' && (
            <span className="rounded-sm bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
              사용 완료
            </span>
          )}
          {coupon.status === 'EXPIRED' && (
            <span className="rounded-sm bg-destructive-subtle px-2 py-0.5 text-[10.5px] font-bold text-destructive">
              만료
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
