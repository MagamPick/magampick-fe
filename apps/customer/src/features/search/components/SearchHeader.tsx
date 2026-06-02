import { ChevronLeft, Search, X } from 'lucide-react'

interface SearchHeaderProps {
  value: string
  onChange: (value: string) => void
  /** Enter 제출 */
  onSubmit: () => void
  /** ✕ 입력 비우기 */
  onClear: () => void
  onBack: () => void
}

/** 검색 헤더 — 뒤로 + 입력칸 + 지우기(✕). 프로토타입 53-search `.search-bar-wrap` 치수. */
export function SearchHeader({ value, onChange, onSubmit, onClear, onBack }: SearchHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-shrink-0 items-center gap-2 border-b border-border bg-card px-5 py-3">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={onBack}
        className="flex h-11 w-9 flex-shrink-0 items-center justify-center text-foreground"
      >
        <ChevronLeft className="size-[22px]" aria-hidden />
      </button>
      <label className="flex h-11 flex-1 items-center gap-2 rounded-[12px] bg-background px-[14px]">
        <Search className="size-[18px] flex-shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="text"
          autoFocus
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit()
          }}
          placeholder="가게·메뉴를 검색해 보세요"
          aria-label="검색어 입력"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[#bdbdbd]"
        />
        {value.length > 0 && (
          <button
            type="button"
            aria-label="입력 지우기"
            onClick={onClear}
            className="flex size-[22px] flex-shrink-0 items-center justify-center rounded-full bg-[#bdbdbd] text-white"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </label>
    </header>
  )
}
