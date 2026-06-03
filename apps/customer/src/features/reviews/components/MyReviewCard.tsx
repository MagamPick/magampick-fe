import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import type { MyReview } from '../types'

function starString(rating: number) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface Props {
  review: MyReview
  onEdit: (review: MyReview) => void
  onDelete: (review: MyReview) => void
}

/**
 * 내가 쓴 리뷰 카드 — 매장 상세 리뷰 카드(store-detail ReviewCard)와 같은 톤.
 * 매장·구매 상품(각 상세 링크)·별점·본문·사진·태그 + 사장 답글 또는 수정·삭제.
 * 답글이 달리면 수정·삭제 잠금. 프로토타입 62-my-reviews.
 */
export function MyReviewCard({ review, onEdit, onDelete }: Props) {
  const locked = review.ownerReply !== null

  return (
    <div className="mb-2 rounded-[12px] border border-border bg-card px-[14px] py-[13px]">
      {/* 매장 헤더 */}
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-cream text-[15px]">
          {review.storeEmoji}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">
          {review.storeName}
        </span>
        <span className="text-[11px] text-placeholder">{formatDate(review.createdAt)}</span>
      </div>

      {/* 구매 상품 — 좌우 배지(공간 부족 시 줄바꿈), 누르면 상품 상세 */}
      {review.items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.items.map((item) => (
            <Link
              key={item.productId}
              to={ROUTES.PRODUCT_DETAIL(item.kind, item.productId)}
              className="rounded-md bg-background px-2.5 py-1 text-[12px] font-bold text-foreground transition active:scale-[0.97]"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* 별점 */}
      <div className="mt-2 text-[12px] tracking-[1px] text-warning">{starString(review.rating)}</div>

      {/* 본문 */}
      {review.content && <p className="mt-[7px] text-[13px] leading-[1.5]">{review.content}</p>}

      {/* 사진 */}
      {review.photos.length > 0 && (
        <div className="mt-[9px] flex gap-1.5">
          {review.photos.map((src, i) => (
            <span
              key={i}
              className="aspect-square max-w-[110px] flex-1 overflow-hidden rounded-lg bg-background"
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </span>
          ))}
        </div>
      )}

      {/* 태그 */}
      {review.tags.length > 0 && (
        <div className="mt-[9px] flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-[9px] py-[3px] text-[11px] font-bold text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 사장 답글(잠금) 또는 수정·삭제 */}
      {locked ? (
        <div className="mt-[9px] rounded-[9px] bg-cream px-[11px] py-[9px]">
          <span className="text-[11px] font-bold text-secondary-foreground">사장님 답글</span>
          <p className="mt-[3px] text-[12px] leading-[1.45]">{review.ownerReply}</p>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="flex-1 rounded-[10px] border border-border py-2 text-[13px] font-bold text-foreground transition active:scale-[0.98]"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete(review)}
            className="flex-1 rounded-[10px] border border-destructive/30 py-2 text-[13px] font-bold text-destructive transition active:scale-[0.98]"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}
