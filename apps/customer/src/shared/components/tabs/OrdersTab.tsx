import { useNavigate } from 'react-router'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ROUTES } from '@/shared/lib/routes'
import { useReviewableOrders } from '@/features/reviews/hooks/useReviewableOrders'
import { ReviewableOrderCard } from '@/features/reviews/components/ReviewableOrderCard'
import type { ReviewableOrder } from '@/features/reviews/types'

/**
 * 주문 탭 — 현재는 '픽업 완료 주문' 목록으로 리뷰 작성/보기 진입만 제공(Phase 6 리뷰).
 * 주문 본기능(상세·결제·취소 등)은 별도 order Phase 에서 교체.
 */
export function OrdersTab() {
  const navigate = useNavigate()
  const { data: orders, isPending } = useReviewableOrders()

  const handleWrite = (order: ReviewableOrder) => navigate(ROUTES.REVIEW_WRITE(order.orderId))
  const handleView = (order: ReviewableOrder) => {
    if (order.reviewId) navigate(ROUTES.REVIEW_EDIT(order.reviewId))
  }

  return (
    <ScreenContainer variant="tab" className="pt-[env(safe-area-inset-top,0px)]">
      <header className="flex h-[52px] items-center px-5">
        <h1 className="text-[18px] font-extrabold text-foreground">주문 내역</h1>
      </header>
      <div className="px-5 pb-6">
        <p className="mb-3 text-[13px] text-muted-foreground">픽업 완료한 주문에 리뷰를 남겨보세요</p>

        {isPending || !orders ? (
          <div className="h-[110px] animate-pulse rounded-[14px] bg-muted" />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <span className="text-[40px]">🧾</span>
            <p className="text-sm text-muted-foreground">완료한 주문이 없어요.</p>
          </div>
        ) : (
          orders.map((order) => (
            <ReviewableOrderCard
              key={order.orderId}
              order={order}
              onWrite={handleWrite}
              onView={handleView}
            />
          ))
        )}
      </div>
    </ScreenContainer>
  )
}
