import { ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { WEEKDAY_LABEL } from '../types'
import type { DayHoursForm, OperationStatus, Weekday } from '../types'
import { formatRange, isTodayLocked } from '../lib/businessHours'

interface Props {
  /** 월~일 7행 (폼 draft) */
  days: DayHoursForm[]
  /** 오늘 요일 코드 */
  today: Weekday
  /** 현재 영업 상태 — OPEN 이면 오늘 행 잠금 */
  operationStatus?: OperationStatus
  /** 오늘이 영업일(저장된 상태)인지 — 잠금 판정 (휴무면 신규추가 허용 → 잠금 X) */
  todayPersistedOpen: boolean
  /** 행 편집 진입 (index = days 인덱스) */
  onEditDay: (index: number) => void
}

const ROW = 'flex min-h-11 w-full items-center gap-3 border-b border-border py-3 last:border-b-0'

/** 요일별 영업시간 목록 — 행 탭 시 편집 시트. 영업중 오늘 행은 잠금. (프로토타입 41-store-hours) */
export function BusinessHoursList({
  days,
  today,
  operationStatus,
  todayPersistedOpen,
  onEditDay,
}: Props) {
  return (
    <div className="mx-5 mt-4 rounded-[16px] border border-border bg-card px-[18px] py-4">
      <div className="mb-2.5 text-[13px] font-bold text-muted-foreground">요일별 영업시간</div>
      {days.map((d, index) => {
        const label = WEEKDAY_LABEL[d.day]
        const timeText = d.closed ? '휴무' : formatRange(d.openTime, d.closeTime)
        const locked = isTodayLocked(
          d.day,
          today,
          operationStatus ?? 'CLOSED_TODAY',
          todayPersistedOpen,
        )

        if (locked) {
          return (
            <div key={d.day} className={ROW}>
              <span className="w-16 shrink-0 text-[14px] font-bold text-foreground">{label}</span>
              <span className="flex-1 text-[14px] font-semibold text-foreground">{timeText}</span>
              <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-muted-foreground">
                <Lock className="size-3.5" aria-hidden />
                영업 중 변경 불가
              </span>
            </div>
          )
        }

        return (
          <button
            key={d.day}
            type="button"
            aria-label={`${label} 영업시간 편집`}
            onClick={() => onEditDay(index)}
            className={cn(ROW, 'text-left transition active:opacity-60')}
          >
            <span className="w-16 shrink-0 text-[14px] font-bold text-foreground">{label}</span>
            <span
              className={cn(
                'flex-1 text-[14px] font-semibold',
                d.closed ? 'text-placeholder' : 'text-foreground',
              )}
            >
              {timeText}
            </span>
            <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
