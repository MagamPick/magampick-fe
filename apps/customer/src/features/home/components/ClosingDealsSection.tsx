import { Timer } from 'lucide-react'
import { ROUTES } from '@/shared/lib/routes'
import { STORE_SORT } from '@/features/store-list/types'
import { useClosingDeals } from '../hooks/useClosingDeals'
import { DealCard } from './DealCard'
import { SectionEmpty } from './SectionEmpty'
import { SectionHeader } from './SectionHeader'

/** ① 마감 임박 특가 — 가로 스크롤. 더보기 → 전체 매장(마감임박순 정렬 적용). */
export function ClosingDealsSection() {
  const { data, isPending, isError } = useClosingDeals()

  return (
    <section className="px-5 pt-[22px]">
      <SectionHeader
        title={<span className="inline-flex items-center gap-1.5"><Timer aria-hidden className="size-[15px] text-primary" />마감 임박 특가</span>}
        moreTo={`${ROUTES.ALL}?sort=${STORE_SORT.CLOSING}`}
      />
      {isPending ? (
        <div className="-mx-5 flex gap-3 overflow-hidden px-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[200px] w-[158px] flex-shrink-0 animate-pulse rounded-[14px] bg-muted"
            />
          ))}
        </div>
      ) : isError ? (
        <SectionEmpty>지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.</SectionEmpty>
      ) : data.length === 0 ? (
        <SectionEmpty>지금 마감 임박한 떨이가 없어요.</SectionEmpty>
      ) : (
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </section>
  )
}
