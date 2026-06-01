import { cn } from '@/shared/lib/utils'
import type { OrderStatus } from '../types'

interface Props {
  status: OrderStatus
}

const TERMINAL = ['CANCELLED', 'REJECTED', 'NO_SHOW'] as OrderStatus[]

// 단계별 완료 여부
function stepsDone(status: OrderStatus): [boolean, boolean, boolean] {
  if (status === 'PENDING') return [true, false, false]
  if (status === 'PREPARING' || status === 'READY') return [true, true, false]
  if (status === 'COMPLETED') return [true, true, true]
  // 종료 상태 — 결제완료만 done
  return [true, false, false]
}

/** 소비자 주문 3단계 스테퍼: 결제 완료 → 픽업 대기 → 픽업 완료 */
export function OrderStepper({ status }: Props) {
  const isTerminal = TERMINAL.includes(status)
  const [s1, s2, s3] = stepsDone(status)

  return (
    <div className="flex items-center justify-center gap-0 px-6 py-5">
      <Step label="결제 완료" done={s1} active={!s1} index={1} />
      <Line done={s2} />
      {isTerminal ? (
        <TerminalStep />
      ) : (
        <>
          <Step label="픽업 대기" done={s2} active={s2 && !s3} index={2} />
          <Line done={s3} />
          <Step label="픽업 완료" done={s3} active={s3} index={3} />
        </>
      )}
    </div>
  )
}

function Step({
  label,
  done,
  active,
  index,
}: {
  label: string
  done: boolean
  active: boolean
  index: number
}) {
  return (
    <div className="flex flex-col items-center gap-1.5" data-step data-done={done || undefined}>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-full text-[13px] font-bold',
          done
            ? 'bg-primary text-white'
            : active
              ? 'border-2 border-primary bg-white text-primary'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {done ? '✓' : index}
      </span>
      <span
        className={cn(
          'text-[11px] font-semibold',
          done || active ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </div>
  )
}

function Line({ done }: { done: boolean }) {
  return <div className={cn('mb-5 h-[2px] w-12 flex-shrink-0', done ? 'bg-primary' : 'bg-muted')} />
}

function TerminalStep() {
  return (
    <div className="flex flex-col items-center gap-1.5" data-step>
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[13px] font-bold text-muted-foreground">
        ✕
      </span>
      <span className="text-[11px] font-semibold text-muted-foreground">취소됨</span>
    </div>
  )
}
