import { Store } from 'lucide-react'
import type { Pickup } from '@/features/cart/types'
import { pickupLabel } from '../lib/pickupLabel'

/** 픽업 매장 + 시간 카드 (프로토타입 .pickup-card) */
export function PickupInfoCard({ storeName, pickup }: { storeName: string; pickup: Pickup }) {
  return (
    <div className="flex items-center gap-[11px]">
      <span className="flex size-12 flex-shrink-0 items-center justify-center rounded-[11px] bg-background">
        <Store className="size-5 text-primary/40" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-foreground">{storeName}</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          픽업 시간 · <b className="font-bold text-primary">{pickupLabel(pickup)}</b>
        </p>
      </div>
    </div>
  )
}
