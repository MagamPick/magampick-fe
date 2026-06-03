import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { ROUTES } from '@/shared/lib/routes'
import type { StoreListItem } from '../types'

/**
 * 전체 매장 리스트 카드 — 썸네일 + 매장명(+단골 뱃지) + 거리·평점 + 진행 중 마감 할인 개수.
 * 진행 중 할인 0건이면 할인 줄 생략, 리뷰 0개(rating 0)면 별점 생략. 탭 → 매장 상세.
 * 홈 StoreRow·단골 FavoriteListCard 와 동일한 행 패턴(썸네일 64·border-b)을 따른다.
 */
export function StoreListCard({ store }: { store: StoreListItem }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.STORE_DETAIL(store.id))}
      className="flex w-full items-center gap-3 border-b border-border py-[13px] text-left last:border-b-0"
    >
      <Thumbnail
        src={store.imageUrl}
        className="size-16 flex-shrink-0 rounded-[12px]"
        iconClassName="size-7"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold">{store.name}</span>
          {store.isFavorite && (
            <span className="flex-shrink-0 rounded-[8px] bg-secondary px-[7px] py-0.5 text-[11px] font-bold text-secondary-foreground">
              단골
            </span>
          )}
        </span>
        <span className="mt-[3px] block text-xs text-muted-foreground">
          {store.distanceKm}km{store.rating > 0 && ` · ★ ${store.rating}`}
        </span>
        {store.activeDealCount > 0 && (
          <span className="mt-1 block text-xs font-bold text-secondary-foreground">
            진행 중 마감 할인 {store.activeDealCount}건
          </span>
        )}
      </span>
      <ChevronRight className="size-[18px] flex-shrink-0 text-placeholder" aria-hidden />
    </button>
  )
}
