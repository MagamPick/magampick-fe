import { ChevronRight } from 'lucide-react'
import { useComingSoon } from '../hooks/useComingSoon'
import { Thumbnail } from './Thumbnail'
import type { NeighborhoodStore } from '../types'

/** ③ 우리 동네 마감픽 — 매장 단위 리스트 row(거리·평점·할인수). 0건이면 배지 생략. 탭 시 매장 상세(준비 중). */
export function StoreRow({ store }: { store: NeighborhoodStore }) {
  const { show } = useComingSoon()
  return (
    <button
      type="button"
      onClick={() => show('매장 상세는 준비 중이에요.')}
      className="flex w-full items-center gap-3 border-b border-border py-[13px] text-left last:border-b-0"
    >
      <Thumbnail
        src={store.imageUrl}
        className="size-16 flex-shrink-0 rounded-[12px]"
        iconClassName="size-7"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{store.name}</span>
        <span className="mt-[3px] block text-xs text-muted-foreground">
          {store.distanceKm}km · ★ {store.rating}
        </span>
        {store.activeDealCount > 0 && (
          <span className="mt-1 block text-xs font-bold text-secondary-foreground">
            진행 중 마감 할인 {store.activeDealCount}건
          </span>
        )}
      </span>
      <ChevronRight className="size-[18px] flex-shrink-0 text-[#bdbdbd]" aria-hidden />
    </button>
  )
}
