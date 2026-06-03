import { cn } from '@/shared/lib/utils'
import type { StoreDetail } from '../types'
import { businessStatusLabel, businessStatusTone } from '../lib/businessStatus'

/** 매장명 + 한 줄 메타 (영업상태 라벨 · 마감 시각 · 평점(리뷰수) · 거리) */
export function StoreHeadMeta({ store }: { store: StoreDetail }) {
  return (
    <div className="px-5 pb-1 pt-4">
      <h1 className="text-[20px] font-extrabold tracking-[-0.4px]">{store.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
        <span className={cn('font-bold', businessStatusTone(store.businessStatus))}>
          {businessStatusLabel(store.businessStatus)}
        </span>
        <Dot />
        <span>{store.closingTime} 마감</span>
        <Dot />
        <span>
          ★ {store.rating} ({store.reviewCount})
        </span>
        <Dot />
        <span>{store.distanceKm}km</span>
      </div>
    </div>
  )
}

const Dot = () => <span className="size-[3px] rounded-full bg-placeholder" aria-hidden />
