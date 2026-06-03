import { cn } from '@/shared/lib/utils'
import { Skeleton } from './ui/skeleton'

/**
 * 리스트 행 스켈레톤 — 썸네일(선택) + 텍스트 2줄을 count 행만큼.
 * 매장·주문·리뷰처럼 미디어가 있는 행은 media(기본값 true), 포인트·공지처럼 텍스트만인 행은 media={false}.
 */
export function ListRowSkeleton({
  count = 3,
  media = true,
  className,
}: {
  count?: number
  media?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} data-slot="skeleton-row" className="flex items-center gap-3">
          {media && (
            <Skeleton data-slot="skeleton-thumb" className="size-16 flex-shrink-0 rounded-[12px]" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** 카드 스켈레톤 — 테두리 카드 안에 텍스트 줄을 count 개만큼. 쿠폰·이벤트·리뷰 카드 로딩용. */
export function CardSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-slot="skeleton-card"
          className="space-y-3 rounded-[14px] border border-border p-4"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
