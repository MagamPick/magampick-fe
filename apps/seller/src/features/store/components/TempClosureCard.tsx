import { Switch } from '@/shared/components/ui/switch'

interface Props {
  /** 오늘 휴무(임시휴업) 여부 = 영업 상태 CLOSED_TODAY */
  closedToday: boolean
  disabled?: boolean
  onToggle: (closed: boolean) => void
}

/**
 * 임시 휴업 — "오늘 하루 임시휴업" 토글 (영업 상태 CLOSED_TODAY 를 표면화).
 * 프로토타입 41-store-hours 임시휴업 카드. 영업 상태 관리(별도 기능)를 재사용.
 */
export function TempClosureCard({ closedToday, disabled, onToggle }: Props) {
  return (
    <div className="mx-5 mt-3 rounded-[16px] border border-border bg-card px-[18px] py-4">
      <div className="mb-2.5 text-[13px] font-bold text-muted-foreground">임시 휴업</div>
      <div className="flex items-center gap-3">
        <span className="flex-1 text-[14px] font-bold text-foreground">오늘 하루 임시휴업</span>
        <Switch
          aria-label="오늘 하루 임시휴업"
          checked={closedToday}
          disabled={disabled}
          onCheckedChange={onToggle}
        />
      </div>
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
        임시휴업을 켜면 그동안 고객 앱에서 매장이 노출되지 않아요.
      </p>
    </div>
  )
}
