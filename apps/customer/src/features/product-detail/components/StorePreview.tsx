import { ChevronRight } from 'lucide-react'

/** 매장 정보 미리보기 — 매장명·거리 한 줄. 탭 시 매장 상세로 이동 */
export function StorePreview({
  storeName,
  distanceKm,
  onTap,
}: {
  storeName: string
  distanceKm: number
  onTap: () => void
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center gap-0.5 text-left text-[13px] font-semibold text-muted-foreground"
    >
      <span>
        {storeName} · {distanceKm}km
      </span>
      <ChevronRight className="size-3.5" aria-hidden />
    </button>
  )
}
