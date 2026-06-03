import { cn } from '@/shared/lib/utils'

export interface SegTabItem<T extends string> {
  value: T
  label: string
  /** 우측 개수 배지 (옵션) */
  count?: number
}

interface SegTabsProps<T extends string> {
  tabs: SegTabItem<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

/**
 * 세그먼트 탭 (프로토타입 `.seg-tabs`) — 하단 인셋 언더라인, count 배지 옵션.
 * 포인트 내역 / 쿠폰함 공용.
 */
export function SegTabs<T extends string>({ tabs, value, onChange, ariaLabel }: SegTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-shrink-0 gap-0.5 border-b border-border bg-card px-5"
    >
      {tabs.map((tab) => {
        const on = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative min-h-12 flex-1 py-[13px] text-sm transition',
              on ? 'font-bold text-primary' : 'font-semibold text-muted-foreground',
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  'ml-1 rounded-sm px-1.5 py-px text-[11px] font-bold',
                  on ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.count}
              </span>
            )}
            {on && (
              <span
                className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-full bg-primary"
                aria-hidden
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
