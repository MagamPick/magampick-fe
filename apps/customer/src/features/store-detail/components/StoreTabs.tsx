import { cn } from '@/shared/lib/utils'
import { STORE_TABS, type StoreTabKey } from '../lib/tabs'

/** 매장 상세 세그먼트 탭 (로컬 상태 — 딥링크 없음) */
export function StoreTabs({
  active,
  onSelect,
}: {
  active: StoreTabKey
  onSelect: (key: StoreTabKey) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="매장 정보 탭"
      className="sticky top-0 z-10 flex gap-[2px] border-b border-border bg-card px-5"
    >
      {STORE_TABS.map((tab) => {
        const selected = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(tab.key)}
            className={cn(
              'relative min-h-[48px] flex-1 px-1 py-[13px] text-sm',
              selected ? 'font-bold text-primary' : 'font-semibold text-muted-foreground',
            )}
          >
            {tab.label}
            {selected && (
              <span className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-[2px] bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
