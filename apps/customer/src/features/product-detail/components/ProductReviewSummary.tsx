import { ChevronRight, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/**
 * 상품 단위 평점·리뷰 영역 — 별점·평균·리뷰 개수.
 * 탭 시 매장 상세 리뷰 탭으로 이동. 0건이면 안내 문구.
 * (상품 단위 리뷰 데이터는 Phase 6 — 현재 mock 요약)
 */
export function ProductReviewSummary({
  rating,
  reviewCount,
  onTap,
}: {
  rating: number
  reviewCount: number
  onTap: () => void
}) {
  const filled = Math.round(rating)
  return (
    <button
      type="button"
      onClick={onTap}
      className="mt-2.5 flex w-full items-center gap-2 rounded-[12px] border border-border bg-card p-[13px] text-left"
    >
      {reviewCount > 0 ? (
        <>
          <span className="text-[15px] font-extrabold">{rating.toFixed(1)}</span>
          <span className="flex" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-3.5',
                  i < filled ? 'fill-warning text-warning' : 'fill-border text-border',
                )}
              />
            ))}
          </span>
          <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
            리뷰 {reviewCount}개
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
        </>
      ) : (
        <span className="flex w-full items-center text-[13px] font-semibold text-muted-foreground">
          아직 리뷰 없어요
          <ChevronRight className="ml-auto size-3.5" aria-hidden />
        </span>
      )}
    </button>
  )
}
