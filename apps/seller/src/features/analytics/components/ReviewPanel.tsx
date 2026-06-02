import { MetricHero } from './MetricHero'
import { StatRows } from './StatRows'
import { formatPercent, formatRating, formatUnit, topTags } from '../lib/analyticsFormat'
import type { ReviewMetrics } from '../types'

/** 리뷰 패널 상위 노출 태그 개수 */
const TOP_TAG_LIMIT = 5

/**
 * 리뷰 패널 — 평균 별점(히어로) + 신규 리뷰·답글 작성률 + 자주 언급된 빠른평가 태그(고정 7종 카운트 집계).
 * NLP·텍스트 마이닝 아님 — 고정 태그 카운트 상위만 노출.
 */
export function ReviewPanel({ review }: { review: ReviewMetrics }) {
  const tags = topTags(review.tags, TOP_TAG_LIMIT)
  return (
    <div>
      <MetricHero label="평균 별점" value={`⭐ ${formatRating(review.avgRating)}`} />
      <div className="px-5 pt-5">
        <StatRows
          rows={[
            { key: '신규 리뷰', value: formatUnit(review.newCount, '건') },
            { key: '답글 작성률', value: formatPercent(review.replyRate) },
          ]}
        />
      </div>
      <section className="px-5 pt-5">
        <h2 className="mb-3 text-[16px] font-bold tracking-[-0.3px] text-foreground">
          자주 언급된 빠른평가
        </h2>
        {tags.length === 0 ? (
          <p className="text-[13.5px] text-muted-foreground">아직 집계된 태그가 없어요.</p>
        ) : (
          <ul className="flex flex-wrap gap-[7px]">
            {tags.map((t) => (
              <li
                key={t.tag}
                className="rounded-2xl bg-secondary px-3 py-[7px] text-[12.5px] font-semibold text-secondary-foreground"
              >
                # {t.tag} {t.count}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
