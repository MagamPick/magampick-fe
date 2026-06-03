import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { getAvailableActions } from '../lib/transitions'
import { useTransitionStatus } from '../hooks/useTransitionStatus'
import type { OperationStatus, StoreStatus } from '../types'

const SHEET_DESC: Record<OperationStatus, string> = {
  OPEN: '현재 영업 중이에요.',
  BREAK: '잠시 휴식 중이에요.',
  CLOSED_TODAY: '오늘 영업이 종료된 상태예요.',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  status: StoreStatus
}

/** 영업 상태 관리 시트 — 현재 상태별 전환 액션 (프로토타입 #bizStatusSheet + 노션 3상태) */
export function BizStatusSheet({ open, onOpenChange, storeId, status }: Props) {
  const transition = useTransitionStatus(storeId)
  const actions = getAvailableActions(status.operationStatus, status.canOpenToday)

  function handle(to: OperationStatus, enabled: boolean) {
    if (!enabled || transition.isPending) return
    transition.mutate(to, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">영업 상태 관리</SheetTitle>
          <SheetDescription>{SHEET_DESC[status.operationStatus]}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4 pb-2">
          {actions.map((action) => (
            <button
              key={action.to}
              type="button"
              disabled={!action.enabled || transition.isPending}
              onClick={() => handle(action.to, action.enabled)}
              className="flex w-full items-center gap-3.5 rounded-[14px] border-[1.5px] border-border bg-card px-4 py-4 text-left transition active:border-primary disabled:opacity-50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                {action.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-bold text-foreground">{action.label}</span>
                <span className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {action.enabled ? action.description : action.disabledReason}
                </span>
              </span>
              <span aria-hidden className="text-lg text-muted-foreground">
                ›
              </span>
            </button>
          ))}
        </div>

        {transition.isError && (
          <p className="px-4 pb-2 text-[12.5px] text-destructive" role="alert">
            전환에 실패했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
