import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { useCartStore } from '../stores/cartStore'
import { buildPickupSlots } from '../lib/buildPickupSlots'

/**
 * 픽업 시간 선택 — "가능한 빨리(ASAP)" + 매장 마감 전까지 15분 단위 슬롯(노션 정책).
 * 슬롯은 매장 마감시각 기준 생성. now 는 렌더 순수성 위해 1회 캡처(테스트는 nowMs 주입).
 */
export function PickupTimeSelector({ nowMs }: { nowMs?: number }) {
  const store = useCartStore((s) => s.store)
  const pickup = useCartStore((s) => s.pickup)
  const setPickup = useCartStore((s) => s.setPickup)
  const [capturedNow] = useState(() => nowMs ?? Date.now())

  if (!store) return null
  const slots = buildPickupSlots(store.closingTime, capturedNow)

  return (
    <section className="mx-5 mt-4 rounded-[14px] border border-border bg-card p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-extrabold text-foreground">픽업 시간</span>
        <span className="text-xs font-semibold text-muted-foreground">
          매장 마감 전까지 픽업해 주세요
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        <PickupChip selected={pickup.type === 'asap'} onClick={() => setPickup({ type: 'asap' })}>
          가능한 빨리
        </PickupChip>
        {slots.map((time) => (
          <PickupChip
            key={time}
            selected={pickup.type === 'slot' && pickup.time === time}
            onClick={() => setPickup({ type: 'slot', time })}
          >
            {time}
          </PickupChip>
        ))}
      </div>
    </section>
  )
}

function PickupChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 flex-shrink-0 items-center whitespace-nowrap rounded-[11px] border-[1.5px] px-3.5 text-[13px] transition-colors',
        selected
          ? 'border-primary bg-secondary font-extrabold text-secondary-foreground'
          : 'border-border bg-card font-semibold text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}
