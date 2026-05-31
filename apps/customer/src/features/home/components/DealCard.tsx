import { useNavigate } from 'react-router'
import { CountdownBadge } from './CountdownBadge'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { ROUTES } from '@/shared/lib/routes'
import type { ClosingDeal } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** ① 마감 임박 특가 — 떨이 상품 단위 가로 카드 (158px). 탭 시 상품 상세로 이동. */
export function DealCard({ deal }: { deal: ClosingDeal }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.PRODUCT_DETAIL('deal', deal.id))}
      className="w-[158px] flex-shrink-0 overflow-hidden rounded-[14px] border border-border bg-card text-left"
    >
      <span className="relative block h-[104px]">
        <Thumbnail src={deal.imageUrl} className="h-full w-full" iconClassName="size-9" />
        <span className="absolute left-2 top-2">
          <CountdownBadge deadline={deal.pickupDeadline} />
        </span>
      </span>
      <span className="block px-4 pb-4 pt-3.5">
        <span className="block text-[11px] font-semibold text-muted-foreground">{deal.storeName}</span>
        <span className="mt-[3px] block h-[35px] overflow-hidden text-[13px] font-bold leading-[1.35]">
          {deal.productName}
        </span>
        <span className="mt-1.5 flex flex-wrap items-baseline gap-1">
          <span className="text-[12.5px] font-extrabold text-destructive">{deal.discountRate}%</span>
          <span className="text-[11px] text-[#bdbdbd] line-through">{won(deal.originalPrice)}</span>
          <span className="text-sm font-extrabold text-foreground">{won(deal.salePrice)}</span>
        </span>
      </span>
    </button>
  )
}
