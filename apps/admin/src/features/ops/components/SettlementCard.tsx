import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/apiError'
import { DateField } from '@/features/events/components/DateField'
import { useProcessSettlement } from '../hooks/useProcessSettlement'

/**
 * 정산 배치 수동 트리거 카드.
 * targetDate(선택, 비우면 오늘) + confirm + POST /admin/settlements/process → "N건 처리됨"(0건도 정상).
 * 위험·되돌릴 수 없는 동작이라 window.confirm 게이트.
 */
export function SettlementCard() {
  const [targetDate, setTargetDate] = useState('')
  const settle = useProcessSettlement()

  const handleRun = () => {
    if (!window.confirm('정산 배치를 실행할까요? 되돌릴 수 없습니다.')) return
    settle.mutate(targetDate || undefined)
  }

  const error =
    settle.error instanceof ApiError
      ? settle.error.message
      : settle.error
        ? '정산 실행 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-bold text-foreground">정산 배치 수동 실행</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        대상 날짜를 비우면 오늘 기준으로 정산합니다. 되돌릴 수 없는 동작입니다.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:max-w-[220px] sm:flex-1">
          <span className="mb-1.5 block text-sm font-semibold text-foreground">대상 날짜</span>
          <DateField
            value={targetDate}
            onChange={setTargetDate}
            ariaLabel="정산 대상 날짜"
            placeholder="오늘 (비우면 오늘)"
          />
        </div>
        <Button type="button" onClick={handleRun} disabled={settle.isPending}>
          {settle.isPending ? '실행 중…' : '정산 실행'}
        </Button>
      </div>

      {settle.isSuccess && (
        <p role="status" className="mt-4 text-sm font-semibold text-foreground">
          정산 완료 — {settle.data.processedCount.toLocaleString('ko-KR')}건 처리됨
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
