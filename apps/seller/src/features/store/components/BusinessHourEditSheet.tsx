import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { WEEKDAY_LABEL } from '../types'
import type { DayHoursForm } from '../types'
import { dayHoursError } from '../lib/businessHours'
import { TimePicker } from './TimePicker'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 편집 대상 요일 (null = 닫힘) */
  day: DayHoursForm | null
  /** 저장 시 폼 draft 갱신 (mutation 아님 — 화면의 "변경 저장"이 커밋) */
  onSave: (next: DayHoursForm) => void
}

/** 시트 내부 편집 폼 — `key={day}` 로 remount 되어 초기값이 prop 에서 동기화됨 (useEffect 불필요) */
function DayHoursEditor({
  day,
  onCommit,
  onClose,
}: {
  day: DayHoursForm
  onCommit: (next: DayHoursForm) => void
  onClose: () => void
}) {
  const [closed, setClosed] = useState(day.closed)
  const [openTime, setOpenTime] = useState(day.openTime)
  const [closeTime, setCloseTime] = useState(day.closeTime)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const next: DayHoursForm = { day: day.day, closed, openTime, closeTime }
    const err = dayHoursError(next)
    if (err) {
      setError(err)
      return
    }
    onCommit(next)
  }

  return (
    <div className="flex flex-col px-4 pb-2">
      <button
        type="button"
        onClick={() => {
          setClosed((v) => !v)
          setError(null)
        }}
        className={cn(
          'mb-4 min-h-12 w-full rounded-[12px] border-[1.5px] text-[14px] font-bold transition',
          closed
            ? 'border-destructive bg-destructive/10 text-destructive'
            : 'border-border bg-card text-muted-foreground',
        )}
      >
        {closed ? '휴무 해제' : '이 요일 휴무로 설정'}
      </button>

      <div className={cn('flex flex-col gap-3', closed && 'pointer-events-none opacity-40')}>
        <div className="flex items-center gap-3">
          <span className="w-[50px] shrink-0 text-[13px] font-bold text-muted-foreground">오픈</span>
          <TimePicker
            ariaLabel="오픈 시각"
            value={openTime}
            disabled={closed}
            onChange={(v) => {
              setOpenTime(v)
              setError(null)
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-[50px] shrink-0 text-[13px] font-bold text-muted-foreground">마감</span>
          <TimePicker
            ariaLabel="마감 시각"
            value={closeTime}
            disabled={closed}
            onChange={(v) => {
              setCloseTime(v)
              setError(null)
            }}
          />
        </div>
      </div>

      <p className="mt-2 text-center text-[12px] text-muted-foreground">
        시각을 누르면 시·분을 한 번에 고를 수 있어요.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-[12.5px] font-semibold text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2.5">
        <Button type="button" variant="outline" className="h-12 flex-1 text-[15px]" onClick={onClose}>
          닫기
        </Button>
        <Button type="button" className="h-12 flex-1 text-[15px]" onClick={handleSave}>
          저장
        </Button>
      </div>
    </div>
  )
}

/** 요일 영업시간 편집 시트 — 휴무 토글 + 시각 선택(시·분 한 번에) (프로토타입 #hoursSheet) */
export function BusinessHourEditSheet({ open, onOpenChange, day, onSave }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">
            {day ? `${WEEKDAY_LABEL[day.day]} 영업시간` : '영업시간'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            영업 시작·종료 시각을 설정하거나 휴무로 지정합니다.
          </SheetDescription>
        </SheetHeader>

        {day && (
          <DayHoursEditor
            key={day.day}
            day={day}
            onCommit={(next) => {
              onSave(next)
              onOpenChange(false)
            }}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
