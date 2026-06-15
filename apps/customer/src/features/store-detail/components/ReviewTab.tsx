import { useEffect, useRef } from 'react'
import { useReviewSummary } from '../hooks/useReviewSummary'
import { useStoreReviews } from '../hooks/useStoreReviews'
import { RatingSummary } from './RatingSummary'
import { ReviewCard } from './ReviewCard'
import { TabEmpty, TabLoading } from './TabStates'

/** 리뷰 탭 — 평균/분포 요약 + 리뷰 카드 무한 스크롤 (sentinel 보이면 다음 페이지) */
export function ReviewTab({ storeId }: { storeId: number }) {
  const summaryQuery = useReviewSummary(storeId)
  const reviews = useStoreReviews(storeId)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = reviews

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined' || !hasNextPage) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (summaryQuery.isPending || reviews.isPending) return <TabLoading />
  if (summaryQuery.isError || reviews.isError) return <TabEmpty>리뷰를 불러오지 못했어요.</TabEmpty>

  const all = reviews.data.pages.flatMap((page) => page.items)

  return (
    <div>
      <RatingSummary summary={summaryQuery.data} />
      {all.length === 0 ? (
        <TabEmpty>아직 등록된 리뷰가 없어요.</TabEmpty>
      ) : (
        <div className="px-5 pt-1">
          {all.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {hasNextPage && (
            <div ref={sentinelRef}>
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="my-3 w-full rounded-[12px] border border-border bg-card py-3 text-sm font-bold text-muted-foreground disabled:opacity-60"
              >
                {isFetchingNextPage ? '불러오는 중…' : '리뷰 더 보기'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
