import type { ReviewSummary } from '../types'

/** 리뷰 탭 상단 — 평균 평점 + 1~5점 분포 막대 */
export function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const total = Math.max(1, summary.count)
  return (
    <div className="flex items-center gap-[18px] px-5 py-[18px]">
      <div>
        <div className="text-[40px] font-extrabold leading-none tracking-[-1px]">
          {summary.average.toFixed(1)}
        </div>
        <div className="mt-1 text-sm tracking-[1px] text-warning">★★★★★</div>
        <div className="mt-1 text-[12px] font-semibold text-muted-foreground">
          리뷰 {summary.count}개
        </div>
      </div>
      <div className="flex-1">
        {summary.distribution.map((bucket) => (
          <div key={bucket.star} className="my-[3px] flex items-center gap-2">
            <span className="w-[22px] text-[11px] text-muted-foreground">{bucket.star}점</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-border">
              <span
                className="block h-full rounded-[3px] bg-warning"
                style={{ width: `${(bucket.count / total) * 100}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
