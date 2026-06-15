import { Button } from '@/shared/components/ui/button'

/** offset 페이지네이션 — 이전/다음 + "현재/전체". 1페이지 이하면 렌더 생략. */
export function InquiriesPagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onChange,
}: {
  /** 0-based */
  page: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevious}
        onClick={() => onChange(page - 1)}
      >
        이전
      </Button>
      <span className="text-sm font-medium text-muted-foreground" aria-live="polite">
        {page + 1} / {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onChange(page + 1)}>
        다음
      </Button>
    </div>
  )
}
