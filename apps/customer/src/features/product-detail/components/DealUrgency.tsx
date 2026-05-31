import { Clock } from 'lucide-react'
import { useCountdown } from '@/shared/hooks/useCountdown'

const pad = (n: number) => String(n).padStart(2, '0')
/** ISO → HH:mm (로컬 시각) */
const hhmm = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 떨이 전용 — 픽업 마감 시각 + 실시간 카운트다운 + 남은 개수 */
export function DealUrgency({
  pickupDeadline,
  stockLeft,
}: {
  pickupDeadline: string
  stockLeft: number
}) {
  const { label, isExpired } = useCountdown(pickupDeadline)
  return (
    <div className="mt-3.5 flex items-center gap-2.5 rounded-[12px] bg-[#FCEBEC] px-[15px] py-[13px]">
      <Clock className="size-4 flex-shrink-0 text-destructive" aria-hidden />
      <span className="text-sm font-extrabold text-destructive">
        {isExpired ? '픽업 마감 종료' : `${hhmm(pickupDeadline)} 마감 · ${label} 남음`}
      </span>
      <span className="ml-auto flex-shrink-0 rounded-[9px] bg-card px-2.5 py-[5px] text-xs font-bold text-destructive">
        {stockLeft}개 남음
      </span>
    </div>
  )
}
