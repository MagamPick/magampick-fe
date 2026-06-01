import type { ReviewSummary } from '../types'

function starString(rating: number) {
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

interface Props {
  summary: ReviewSummary
}

/** 리뷰 요약 헤더 — 평균·총개수·답글률. 프로토타입 50-reviews(rating-summary) */
export function ReviewSummaryHeader({ summary }: Props) {
  return (
    <div className="mx-5 mt-4 flex items-center gap-[18px] rounded-[16px] border border-border bg-card p-[18px]">
      <span className="text-[38px] font-extrabold leading-none tracking-[-1px]">
        {summary.average.toFixed(1)}
      </span>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[16px] tracking-[2px] text-warning">
          {starString(summary.average)}
        </span>
        <span className="text-[12.5px] font-semibold text-muted-foreground">
          총 {summary.total}개 리뷰 · 답글률 {summary.replyRate}%
        </span>
      </div>
    </div>
  )
}
