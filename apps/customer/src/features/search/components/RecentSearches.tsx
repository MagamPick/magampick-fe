import { X } from 'lucide-react'

interface RecentSearchesProps {
  items: string[]
  onSelect: (q: string) => void
  onRemove: (q: string) => void
  onClear: () => void
}

/**
 * 최근 검색어 (검색 홈) — 칩 탭 재검색 / ✕ 개별 삭제 / 전체 삭제. 기록 없으면 미표시.
 * 프로토타입 53-search `.recent-chip` (단, 칩 안 버튼 중첩은 형제 버튼으로 교정).
 */
export function RecentSearches({ items, onSelect, onRemove, onClear }: RecentSearchesProps) {
  if (items.length === 0) return null
  return (
    <section className="px-5 pt-[18px]">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[13px] font-extrabold text-foreground">최근 검색</h2>
        <button
          type="button"
          onClick={onClear}
          className="px-1 py-1.5 text-xs font-semibold text-muted-foreground"
        >
          전체 삭제
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((q) => (
          <span
            key={q}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-[18px] border-[1.5px] border-border bg-card py-1 pl-3 pr-2 text-[13px] font-semibold text-muted-foreground"
          >
            <button type="button" onClick={() => onSelect(q)} className="max-w-[180px] truncate">
              {q}
            </button>
            <button
              type="button"
              aria-label={`${q} 삭제`}
              onClick={() => onRemove(q)}
              className="flex size-4 flex-shrink-0 items-center justify-center rounded-full bg-placeholder text-white"
            >
              <X className="size-2.5" aria-hidden />
            </button>
          </span>
        ))}
      </div>
    </section>
  )
}
