import { cn } from '@/shared/lib/utils'
import { STORE_SORT_OPTIONS, type StoreSort } from '../types'

/**
 * 전체 매장 정렬 칩 5종 (추천·거리·할인율·마감임박·별점). 단일 선택, 현재 정렬만 active.
 * 프로토타입 22-all `#allSortRow .cat-chip` 작은 변형 수치 (min-h 34 · radius 14 · 12.5px · border 1.25).
 */
export function StoreSortTabs({
  value,
  onChange,
}: {
  value: StoreSort
  onChange: (sort: StoreSort) => void
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-5 pb-0.5 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STORE_SORT_OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex min-h-[34px] flex-shrink-0 items-center whitespace-nowrap rounded-[14px] border-[1.25px] px-[11px] text-[12.5px] font-semibold transition-colors',
              active
                ? 'border-primary bg-secondary font-bold text-secondary-foreground'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
