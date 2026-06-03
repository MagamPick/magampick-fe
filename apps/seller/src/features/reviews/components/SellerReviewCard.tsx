import type { SellerReview } from '../types'

function starString(rating: number) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface Props {
  review: SellerReview
  onReply: (review: SellerReview) => void
}

/**
 * 사장 리뷰 카드 — 별점·작성자·상품(배지 n개)·본문·사진·키워드(#태그).
 * 답글이 있으면 답글 표시, 없으면 '답글 달기' 버튼(리뷰당 1회). 프로토타입 50-reviews(review-card).
 * 매장 상세·내 리뷰 카드와 같은 톤(radius 12·px14 py13·사진·#태그).
 */
export function SellerReviewCard({ review, onReply }: Props) {
  return (
    <div className="mb-2.5 rounded-[12px] border border-border bg-card p-[14px]">
      <div className="flex items-center gap-[7px]">
        <span className="shrink-0 text-[12px] tracking-[1px] text-warning">
          {starString(review.rating)}
        </span>
        <span className="min-w-0 truncate text-[12px] font-semibold text-muted-foreground">
          {review.authorNickname}
        </span>
        <span className="ml-auto shrink-0 text-[11px] text-placeholder">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* 상품 배지 — 주문 상품 n개 */}
      {review.products.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.products.map((product) => (
            <span
              key={product.name}
              className="rounded-md bg-background px-2.5 py-1 text-[12px] font-bold"
            >
              {product.name}
            </span>
          ))}
        </div>
      )}

      <p className="mt-2 text-[13.5px] leading-[1.55]">{review.content}</p>

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

      {/* 키워드 — #태그 (매장 상세·내 리뷰와 동일한 rounded-full 칩) */}
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

      {review.ownerReply ? (
        <div className="mt-[9px] rounded-[9px] bg-cream px-3 py-2.5">
          <span className="text-[11px] font-bold text-secondary-foreground">사장님 답글</span>
          <p className="mt-1 text-[12.5px] leading-[1.5]">{review.ownerReply}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onReply(review)}
          className="mt-[9px] min-h-11 w-full rounded-[9px] bg-secondary text-[13px] font-bold text-secondary-foreground transition active:scale-[0.99]"
        >
          답글 달기
        </button>
      )}
    </div>
  )
}
