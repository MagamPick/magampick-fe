import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, MessageSquare } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { CardSkeleton } from '@/shared/components/Skeletons'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useStoreReviews } from '../hooks/useStoreReviews'
import { useReviewSummary } from '../hooks/useReviewSummary'
import { ReviewSummaryHeader } from '../components/ReviewSummaryHeader'
import { SellerReviewCard } from '../components/SellerReviewCard'
import { ReviewReplySheet } from '../components/ReviewReplySheet'
import type { SellerReview } from '../types'

/**
 * 리뷰 관리 (프로토타입 50-reviews). 노션 "리뷰 목록 조회(사장) + 리뷰 답글 작성".
 * 요약(평균·답글률) + 매장 리뷰 목록. 답글 없는 카드의 '답글 달기' → 시트로 답글 1회 작성.
 */
export function ReviewManagePage() {
  const navigate = useNavigate()
  const _storeIdNum = useCurrentStoreStore((s) => s.selectedStoreId)
  const storeId = _storeIdNum != null ? String(_storeIdNum) : ''
  const { data: summary } = useReviewSummary(storeId)
  const { data: reviews, isPending, isError, refetch } = useStoreReviews(storeId)
  const [replyTarget, setReplyTarget] = useState<SellerReview | null>(null)

  return (
    <ScreenContainer variant="page" className="pb-10">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">리뷰 관리</h1>
      </header>

      {summary && <ReviewSummaryHeader summary={summary} />}

      <section className="px-5 pt-4">
        <h2 className="mb-3 text-[15px] font-bold">전체 리뷰</h2>
        {isPending ? (
          <CardSkeleton count={3} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()}>리뷰를 불러오지 못했어요.</ErrorState>
        ) : !reviews || reviews.length === 0 ? (
          <EmptyState icon={<MessageSquare />}>아직 리뷰가 없어요.</EmptyState>
        ) : (
          reviews.map((review) => (
            <SellerReviewCard key={review.id} review={review} onReply={setReplyTarget} />
          ))
        )}
      </section>

      <ReviewReplySheet
        review={replyTarget}
        onOpenChange={(open) => {
          if (!open) setReplyTarget(null)
        }}
      />
    </ScreenContainer>
  )
}
