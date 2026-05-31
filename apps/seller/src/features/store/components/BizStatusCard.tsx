import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { getStatusDotClass, getStatusLabel } from '../lib/transitions'
import type { OperationStatus, StoreStatus } from '../types'

/** 인디케이터 캡슐 배경 틴트 (dot 색의 연한 버전) */
const TINT: Record<OperationStatus, string> = {
  OPEN: 'bg-success/10',
  BREAK: 'bg-warning/10',
  CLOSED_TODAY: 'bg-muted-foreground/10',
}

interface Props {
  status?: StoreStatus
  isLoading?: boolean
  onManage: () => void
}

/** 사장 홈 헤더 아래 독립 카드 — 현재 영업 상태 + [관리] (프로토타입 .biz-status-card) */
export function BizStatusCard({ status, isLoading, onManage }: Props) {
  const op = status?.operationStatus
  return (
    <div className="relative mx-5 mt-4 flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 shadow-e2">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          op ? TINT[op] : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'size-2.5 rounded-full',
            op ? getStatusDotClass(op) : 'bg-muted-foreground',
            op === 'OPEN' && 'animate-pulse',
          )}
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11.5px] font-semibold text-muted-foreground">현재 영업 상태</span>
        <span className="truncate text-[15px] font-bold text-foreground">
          {isLoading || !status ? '불러오는 중…' : getStatusLabel(status.operationStatus, status.todayCloseTime)}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={onManage}
        disabled={!status}
        className="h-[34px] shrink-0 rounded-[10px] px-3.5 text-[12.5px]"
      >
        관리
      </Button>
    </div>
  )
}
