import { Clock } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'

/** 픽업 마감 잔여 시간 실시간 카운트다운 배지 (마감 임박 카드 이미지 위 오버레이). */
export function CountdownBadge({ deadline }: { deadline: string }) {
  const { label, isExpired } = useCountdown(deadline)
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/75 px-2 py-1 text-[11px] font-bold tabular-nums text-white">
      <Clock className="size-3" aria-hidden />
      {isExpired ? '마감' : label}
    </span>
  )
}
