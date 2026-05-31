import { ROUTES } from '@/shared/lib/routes'
import { useFavoriteStores } from '../hooks/useFavoriteStores'
import { FavoriteStoreCard } from './FavoriteStoreCard'
import { SectionEmpty } from './SectionEmpty'
import { SectionHeader } from './SectionHeader'

/** ② 단골 가게 — 2열 그리드. 단골 0이면 등록 유도. 더보기 → 단골매장 목록 탭. */
export function FavoriteStoresSection() {
  const { data, isPending, isError } = useFavoriteStores()

  return (
    <section className="px-5 pt-[22px]">
      <SectionHeader title="⭐ 내 단골 가게" moreTo={ROUTES.FAVS} />
      {isPending ? (
        <div className="grid grid-cols-2 gap-[10px]">
          {[0, 1].map((i) => (
            <div key={i} className="h-[170px] animate-pulse rounded-[14px] bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <SectionEmpty>지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.</SectionEmpty>
      ) : data.length === 0 ? (
        <SectionEmpty>아직 단골 가게가 없어요. 자주 가는 가게를 단골로 등록해 보세요.</SectionEmpty>
      ) : (
        <div className="grid grid-cols-2 gap-[10px]">
          {data.map((store) => (
            <FavoriteStoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </section>
  )
}
