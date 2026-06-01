import { MyReviewCard } from './MyReviewCard'
import type { MyReview } from '../types'

interface Props {
  reviews: MyReview[]
  onEdit: (review: MyReview) => void
  onDelete: (review: MyReview) => void
}

/** 내가 쓴 리뷰 목록 — 요약(개수·평균) + 카드. 비어 있으면 안내. 프로토타입 62-my-reviews */
export function MyReviewList({ reviews, onEdit, onDelete }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <span className="text-[40px]">✍️</span>
        <p className="text-sm text-muted-foreground">작성한 리뷰가 없어요.</p>
      </div>
    )
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-[14px] font-semibold">
          <b className="font-extrabold">{reviews.length}</b>개 작성
        </span>
        <span className="text-[14px] font-semibold text-muted-foreground">
          평균 ⭐ <b className="font-extrabold text-foreground">{average.toFixed(1)}</b>
        </span>
      </div>
      <div className="px-5 pb-6">
        {reviews.map((review) => (
          <MyReviewCard key={review.id} review={review} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
