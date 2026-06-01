import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ROUTES } from '@/shared/lib/routes'
import { useMyReviews } from '../hooks/useMyReviews'
import { useDeleteReview } from '../hooks/useDeleteReview'
import { MyReviewList } from '../components/MyReviewList'
import type { MyReview } from '../types'

/** 내가 쓴 리뷰 (프로토타입 62-my-reviews). 수정 → 작성 화면, 삭제 → 확인 후 mock 제거. */
export function MyReviewsPage() {
  const navigate = useNavigate()
  const { data: reviews, isPending } = useMyReviews()
  const del = useDeleteReview()

  const handleEdit = (review: MyReview) => navigate(ROUTES.REVIEW_EDIT(review.id))
  const handleDelete = (review: MyReview) => {
    if (window.confirm('리뷰를 삭제할까요?')) del.mutate(review.id)
  }

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">내가 쓴 리뷰</h1>
      </header>

      <main className="flex-1">
        {isPending || !reviews ? (
          <div className="px-5 pt-4">
            <div className="h-[120px] animate-pulse rounded-[14px] bg-muted" />
          </div>
        ) : (
          <MyReviewList reviews={reviews} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>
    </ScreenContainer>
  )
}
