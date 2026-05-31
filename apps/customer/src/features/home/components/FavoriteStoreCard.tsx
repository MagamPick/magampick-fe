import { useNavigate } from 'react-router'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { ROUTES } from '@/shared/lib/routes'
import type { FavoriteStore } from '../types'

/** ② 단골 가게 — 매장 단위 그리드 카드. 진행 중 할인 0건이면 배지 생략. 탭 시 매장 상세. */
export function FavoriteStoreCard({ store }: { store: FavoriteStore }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.STORE_DETAIL(store.id))}
      className="overflow-hidden rounded-[14px] border border-border bg-card text-left"
    >
      <Thumbnail src={store.imageUrl} className="h-[86px] w-full" iconClassName="size-8" />
      <span className="block px-4 pb-[15px] pt-[13px]">
        <span className="block text-[13px] font-bold">{store.name}</span>
        <span className="mt-[3px] block text-[11px] text-muted-foreground">
          {store.distanceKm}km
        </span>
        {store.activeDealCount > 0 && (
          <span className="mt-[5px] block text-[11px] font-bold text-secondary-foreground">
            진행 중 마감 할인 {store.activeDealCount}건
          </span>
        )}
      </span>
    </button>
  )
}
