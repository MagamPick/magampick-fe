import { ROUTES } from '@/shared/lib/routes'
import { STORE_SORT } from '@/features/store-list/types'
import { useNeighborhoodStores } from '../hooks/useNeighborhoodStores'
import { SectionEmpty } from './SectionEmpty'
import { SectionHeader } from './SectionHeader'
import { StoreRow } from './StoreRow'

/** ③ 우리 동네 마감픽 — 고정 6개 프리뷰. 전체 탐색은 더보기 → 전체 매장(추천순 정렬 적용). */
export function NeighborhoodSection() {
  const { data, isPending, isError } = useNeighborhoodStores()

  return (
    <section className="px-5 pt-[22px]">
      <SectionHeader
        title="📍 우리 동네 마감픽"
        moreTo={`${ROUTES.ALL}?sort=${STORE_SORT.RECOMMENDED}`}
      />
      {isPending ? (
        <div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border py-[13px]">
              <div className="size-16 flex-shrink-0 animate-pulse rounded-[12px] bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <SectionEmpty>지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.</SectionEmpty>
      ) : data.length === 0 ? (
        <SectionEmpty>주변에 추천할 가게가 아직 없어요.</SectionEmpty>
      ) : (
        <div>
          {data.map((store) => (
            <StoreRow key={store.id} store={store} />
          ))}
        </div>
      )}
    </section>
  )
}
