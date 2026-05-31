import { DealCard, type DealCardProps } from '@/features/clearance/components/DealCard'

/** 진행중 마감 할인 요약 (mock — 풀 기능은 마감 할인 탭에서 DealCard 재사용) */
const DEALS: DealCardProps[] = [
  {
    name: '버터 크루아상',
    thumbnail: '🥐',
    originalPrice: 4000,
    salePrice: 2000,
    soldCount: 12,
    totalQty: 20,
    closeTime: '21:00',
    status: 'live',
  },
  {
    name: '우유 식빵',
    thumbnail: '🍞',
    originalPrice: 5500,
    salePrice: 2750,
    soldCount: 5,
    totalQty: 8,
    closeTime: '19:30',
    status: 'soon',
  },
]

export function HomeDealList() {
  return (
    <section className="mx-5 mt-6">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground">진행중 마감 할인</h2>
        <span className="text-[12.5px] font-semibold text-muted-foreground">모두 보기 ›</span>
      </div>
      <div className="flex flex-col gap-2">
        {DEALS.map((deal) => (
          <DealCard key={deal.name} {...deal} />
        ))}
      </div>
    </section>
  )
}
