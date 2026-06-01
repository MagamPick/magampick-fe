import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import type { StoreReview } from '../types'

function starString(rating: number) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 리뷰 카드 — 별점·작성자·본문·사진·태그 + 사장 답글(있으면) */
export function ReviewCard({ review }: { review: StoreReview }) {
  return (
    <div className="mb-2 rounded-[12px] border border-border bg-card px-[14px] py-[13px]">
      <div className="flex items-center gap-[7px]">
        <span className="text-[12px] tracking-[1px] text-warning">{starString(review.rating)}</span>
        <span className="text-[12px] font-semibold text-muted-foreground">
          {review.authorNickname}
        </span>
        <span className="ml-auto text-[11px] text-[#bdbdbd]">{formatDate(review.createdAt)}</span>
      </div>

      {review.products.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.products.map((item) => (
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

      <p className="mt-[7px] text-[13px] leading-[1.5]">{review.content}</p>

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

      {review.tags.length > 0 && (
        <div className="mt-[9px] flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-[9px] py-[3px] text-[11px] font-bold text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {review.ownerReply && (
        <div className="mt-[9px] rounded-[9px] bg-cream px-[11px] py-[9px]">
          <span className="text-[11px] font-bold text-secondary-foreground">사장님 답글</span>
          <p className="mt-[3px] text-[12px] leading-[1.45]">{review.ownerReply}</p>
        </div>
      )}
    </div>
  )
}
