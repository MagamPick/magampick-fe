import { useParams, useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useReviewableOrders } from '../hooks/useReviewableOrders'
import { useMyReviews } from '../hooks/useMyReviews'
import { useCreateReview } from '../hooks/useCreateReview'
import { useUpdateReview } from '../hooks/useUpdateReview'
import { ReviewForm } from '../components/ReviewForm'
import type { QuickTag, ReviewFormValues } from '../types'

/**
 * 리뷰 작성/수정 겸용 (노션: 리뷰 작성 / 수정·삭제).
 * - 작성: /reviews/write/:orderId — 픽업 완료 주문 기준
 * - 수정: /reviews/:reviewId/edit — 기존 리뷰 기준(답글 달리면 API 가 거부 → serverError)
 */
export function ReviewWritePage() {
  const { orderId, reviewId } = useParams<{ orderId?: string; reviewId?: string }>()
  const navigate = useNavigate()
  const isEdit = !!reviewId

  const { data: orders } = useReviewableOrders()
  const { data: myReviews } = useMyReviews()
  const create = useCreateReview()
  const update = useUpdateReview(reviewId ?? '')

  const order = orders?.find((o) => o.orderId === orderId)
  const review = myReviews?.find((r) => r.id === reviewId)
  const source = isEdit ? review : order

  const pending = isEdit ? update.isPending : create.isPending
  const error = isEdit ? update.error : create.error
  const serverError =
    error instanceof ApiError
      ? error.message
      : error
        ? '저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  function handleSubmit(values: ReviewFormValues) {
    if (isEdit) {
      update.mutate(values, { onSuccess: () => navigate(ROUTES.MY_REVIEWS) })
    } else if (orderId) {
      create.mutate({ orderId, ...values }, { onSuccess: () => navigate(ROUTES.MY_REVIEWS) })
    }
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
        <h1 className="text-[17px] font-bold text-foreground">{isEdit ? '리뷰 수정' : '리뷰 작성'}</h1>
      </header>

      {source ? (
        <ReviewForm
          storeEmoji={source.storeEmoji}
          storeName={source.storeName}
          items={source.items}
          defaultValues={
            isEdit && review
              ? {
                  rating: review.rating,
                  content: review.content,
                  tags: review.tags as QuickTag[],
                  photos: review.photos,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isPending={pending}
          serverError={serverError}
          submitLabel={isEdit ? '수정 완료' : '리뷰 등록'}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center px-5 py-20 text-center text-sm text-muted-foreground">
          주문 정보를 불러오는 중…
        </div>
      )}
    </ScreenContainer>
  )
}
