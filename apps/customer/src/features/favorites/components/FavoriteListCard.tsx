import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { ROUTES } from '@/shared/lib/routes'
import type { FavoriteStore } from '../types'

/**
 * 단골매장 목록 카드 — 대표 사진·매장명·거리·별점 평균·진행 중 마감할인 개수. 탭 → 매장 상세.
 * 단골 추가/해제는 매장 상세 우상단에서만 (목록 카드엔 토글 없음 — 실수 탭 방지).
 */
export function FavoriteListCard({ store }: { store: FavoriteStore }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.STORE_DETAIL(String(store.id)))}
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
        {store.activeDealCount > 0 ? (
          <span className="mt-1 block text-xs font-bold text-secondary-foreground">
            진행 중 마감 할인 {store.activeDealCount}건
          </span>
        ) : (
          <span className="mt-1 block text-xs text-muted-foreground">오늘 진행 중 마감 할인 없음</span>
        )}
      </span>
      <ChevronRight className="size-[18px] flex-shrink-0 text-placeholder" aria-hidden />
    </button>
  )
}
