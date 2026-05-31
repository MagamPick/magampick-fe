import { Map, Phone, Share2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const CELL =
  'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 bg-card px-1 py-[11px] text-[12px] font-semibold text-muted-foreground'

/** 매장 액션 3분할 — 전화(tel) · 지도(매장 위치 sub-route) · 공유(share sheet) */
export function StoreActions({
  phone,
  onMap,
  onShare,
}: {
  phone: string
  onMap: () => void
  onShare: () => void
}) {
  return (
    <div className="mx-5 mt-[14px] flex overflow-hidden rounded-[12px] border border-border">
      <a href={`tel:${phone}`} aria-label={`전화 ${phone}`} className={CELL}>
        <Phone className="size-[18px]" aria-hidden />
        전화
      </a>
      <button type="button" onClick={onMap} className={cn(CELL, 'border-l border-border')}>
        <Map className="size-[18px]" aria-hidden />
        지도
      </button>
      <button type="button" onClick={onShare} className={cn(CELL, 'border-l border-border')}>
        <Share2 className="size-[18px]" aria-hidden />
        공유
      </button>
    </div>
  )
}
