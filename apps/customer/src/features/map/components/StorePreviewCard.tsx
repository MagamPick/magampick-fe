import { ChevronRight } from 'lucide-react'
import { Thumbnail } from '@/shared/components/Thumbnail'
import type { MapStore } from '../types'

/**
 * 지도 하단 플로팅 미니카드 — 마커 탭 시 노출. 매장명 + 거리·평점 + 진행 중 마감 할인 개수 + 화살표.
 * 카드/화살표 탭 = 매장 상세(onClick). 프로토타입 21-map `.map-preview` 스펙(썸네일 56·radius 16·플로팅 그림자).
 * 바텀네비(플로팅) 위 14px 에 띄운다.
 */
export function StorePreviewCard({ store, onClick }: { store: MapStore; onClick: () => void }) {
  const meta = `${store.distanceKm}km${store.rating > 0 ? ` · ★ ${store.rating}` : ''}`
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-x-5 z-[40] flex items-center gap-3 rounded-[16px] bg-card p-3 text-left shadow-[0_8px_26px_rgba(0,0,0,0.18)]"
      style={{ bottom: 'calc(64px + 8px + env(safe-area-inset-bottom, 24px) + 14px)' }}
    >
      <Thumbnail
        src={store.imageUrl}
        className="size-14 flex-shrink-0 rounded-[11px]"
        iconClassName="size-6"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{store.name}</span>
        <span className="mt-[3px] block text-xs text-muted-foreground">{meta}</span>
        {store.activeDealCount > 0 && (
          <span className="mt-[3px] block text-xs font-bold text-secondary-foreground">
            {`진행 중 마감 할인 ${store.activeDealCount}건`}
          </span>
        )}
      </span>
      <ChevronRight className="size-[18px] flex-shrink-0 text-placeholder" aria-hidden />
    </button>
  )
}
