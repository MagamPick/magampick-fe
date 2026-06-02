import { cn } from '@/shared/lib/utils'
import type { CouponEventView } from '../api/couponApi'
import { couponConditionText, couponValueText } from '../lib/couponCalc'

interface Props {
  event: CouponEventView
  onClaim: (id: string) => void
  claiming?: boolean
}

/** 이벤트 쿠폰 카드 (프로토타입 `.cp-card--event`) — 좌측 할인값 + 본문 + 우측 [받기] */
export function EventCard({ event, onClaim, claiming = false }: Props) {
  const { claimed } = event
  return (
    <div
      className={cn(
        'flex min-h-[92px] items-stretch overflow-hidden rounded-[14px] border-[1.5px] border-border bg-card',
        claimed && 'opacity-70',
      )}
    >
      <div
        className={cn(
          'flex flex-[0_0_96px] flex-col items-center justify-center gap-1 border-r-[1.5px] border-dashed border-border px-1.5 py-2.5 text-center font-extrabold',
          claimed ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground',
        )}
      >
        <div className="whitespace-nowrap text-lg leading-[1.1] tracking-[-0.4px]">
          {couponValueText(event)}
        </div>
        <div
          className={cn(
            'rounded-sm px-[7px] py-0.5 text-[11px] font-bold',
            claimed ? 'bg-card' : 'bg-white/55',
          )}
        >
          할인
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pl-3.5 pr-3">
        <div className="text-sm font-bold text-foreground">{event.label}</div>
        <div className="text-xs text-muted-foreground">{couponConditionText(event)}</div>
        <div className="mt-auto flex items-center text-[11.5px] font-semibold text-muted-foreground">
          {`~ ${event.expiresAt}`}
        </div>
      </div>
      <div className="flex flex-[0_0_88px] items-center justify-center border-l-[1.5px] border-dashed border-border p-2">
        <button
          type="button"
          disabled={claimed || claiming}
          onClick={() => onClaim(event.id)}
          aria-label={claimed ? '이미 받은 쿠폰' : '쿠폰 받기'}
          className={cn(
            'min-h-11 w-full rounded-md text-[13px] font-extrabold transition active:scale-[0.96]',
            claimed ? 'bg-muted text-muted-foreground' : 'bg-primary text-white',
          )}
        >
          {claimed ? '받기 완료' : '받기'}
        </button>
      </div>
    </div>
  )
}
