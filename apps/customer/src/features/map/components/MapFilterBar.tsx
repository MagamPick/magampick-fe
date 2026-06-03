import { Switch } from '@/shared/components/ui/switch'
import { cn } from '@/shared/lib/utils'
import { MAP_DISTANCES, type MapDistance } from '../types'

/**
 * 지도 상단 필터 — 거리 1/3/5km 단일 선택 칩 + "마감 할인 판매 중" 토글. 변경 즉시 마커 갱신(별도 "적용" 버튼 X).
 * 프로토타입 21-map `.map-filters`(cat-chip 단일선택 + map-toggle) 스펙. 칩 active 는 StoreSortTabs 와 동일 토큰.
 */
export function MapFilterBar({
  distance,
  onDistanceChange,
  dealsOnly,
  onDealsOnlyChange,
}: {
  distance: MapDistance
  onDistanceChange: (distance: MapDistance) => void
  dealsOnly: boolean
  onDealsOnlyChange: (on: boolean) => void
}) {
  return (
    <div className="flex items-center gap-1.5 px-5 pb-3">
      {MAP_DISTANCES.map((d) => {
        const active = d === distance
        return (
          <button
            key={d}
            type="button"
            aria-pressed={active}
            onClick={() => onDistanceChange(d)}
            className={cn(
              'min-h-[34px] rounded-[14px] border-[1.25px] px-[13px] text-[12.5px] font-semibold transition-colors',
              active
                ? 'border-primary bg-secondary font-bold text-secondary-foreground'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {d}km
          </button>
        )
      })}
      <span className="flex-1" />
      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[12.5px] font-bold text-muted-foreground">
        마감 할인 판매 중
        <Switch checked={dealsOnly} onCheckedChange={onDealsOnlyChange} />
      </label>
    </div>
  )
}
