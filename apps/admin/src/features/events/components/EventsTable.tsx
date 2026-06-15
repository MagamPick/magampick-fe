import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { EventStatusBadge } from './EventStatusBadge'
import { formatDiscount, formatIssue, formatPeriod, formatWon } from '../lib/eventFormat'
import type { EventView } from '../types'

const TH = 'px-4 py-3 font-semibold'

/** 이벤트 목록 데스크톱 테이블. ended 행은 수정·조기종료 비활성. 액션은 부모로 콜백. */
export function EventsTable({
  events,
  onEdit,
  onEnd,
}: {
  events: EventView[]
  onEdit: (event: EventView) => void
  onEnd: (event: EventView) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <th className={TH}>라벨</th>
            <th className={TH}>할인</th>
            <th className={TH}>최소주문</th>
            <th className={TH}>쿠폰 만료일</th>
            <th className={TH}>노출 기간</th>
            <th className={TH}>발급</th>
            <th className={TH}>상태</th>
            <th className={cn(TH, 'text-right')}>관리</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const ended = e.status === 'ended'
            return (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold text-foreground">{e.label}</td>
                <td className="px-4 py-3 text-foreground">
                  {formatDiscount(e.discountType, e.value)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatWon(e.minOrder)}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.validUntil}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatPeriod(e.displayStartAt, e.displayEndAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatIssue(e.issuedCount, e.issueLimit)}
                </td>
                <td className="px-4 py-3">
                  <EventStatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={ended}
                      onClick={() => onEdit(e)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={ended}
                      onClick={() => onEnd(e)}
                      className="text-destructive hover:text-destructive"
                    >
                      조기종료
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
