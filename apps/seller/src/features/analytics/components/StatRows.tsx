import { cn } from '@/shared/lib/utils'

export interface StatRow {
  /** 지표명 */
  key: string
  /** 표시값(이미 포맷된 문자열) */
  value: string
  /** 강조(주황) — 픽업 완료율·폐기 절감 금액 등 핵심 수치 */
  accent?: boolean
}

/**
 * 통계 지표 리스트 카드 (프로토타입 `.stat-list`) — 좌측 지표명 / 우측 값, 행 구분선.
 * 매출·주문·떨이·리뷰 패널이 공용으로 쓴다.
 */
export function StatRows({ rows }: { rows: StatRow[] }) {
  return (
    <dl className="rounded-[14px] border border-border bg-card px-4">
      {rows.map((r) => (
        <div
          key={r.key}
          className="flex items-center justify-between border-b border-border py-[14px] last:border-b-0"
        >
          <dt className="text-[13.5px] text-muted-foreground">{r.key}</dt>
          <dd
            className={cn('text-[15px] font-bold', r.accent ? 'text-primary' : 'text-foreground')}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
