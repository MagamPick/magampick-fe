import { Switch } from '@/shared/components/ui/switch'
import type { SettingMeta } from '../constants'

/** 알림 설정 토글 1행 — 라벨 + 설명 + Switch */
export function NotificationSettingItem({
  meta,
  checked,
  onCheckedChange,
}: {
  meta: SettingMeta
  checked: boolean
  onCheckedChange: (on: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold text-foreground">{meta.label}</span>
        <span className="text-[13px] leading-snug text-muted-foreground">{meta.desc}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={meta.label} />
    </div>
  )
}
