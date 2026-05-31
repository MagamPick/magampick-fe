import { Clock } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { ROUTES } from '@/shared/lib/routes'
import type { StoreDeal } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 마감 할인 탭의 떨이 행 — 실시간 카운트다운. 영업 외면 dim. 탭 시 상품 상세로 이동 */
export function DealItem({ deal, orderable }: { deal: StoreDeal; orderable: boolean }) {
  const navigate = useNavigate()
  const { label, isExpired, remainingMs } = useCountdown(deal.pickupDeadline)
  const urgent = !isExpired && remainingMs <= 10 * 60_000

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.PRODUCT_DETAIL('deal', deal.id))}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border py-[13px] text-left last:border-b-0',
        !orderable && 'opacity-60',
      )}
    >
      <Thumbnail
        src={deal.imageUrl}
        className="size-[66px] flex-shrink-0 rounded-[12px]"
        iconClassName="size-8"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{deal.name}</span>
        <span className="mt-[5px] flex items-baseline gap-[5px]">
          <span className="text-[15px] font-extrabold text-destructive">{deal.discountRate}%</span>
          <span className="text-[12px] text-[#bdbdbd] line-through">{won(deal.originalPrice)}</span>
          <span className="text-[17px] font-extrabold text-foreground">{won(deal.salePrice)}</span>
        </span>
        <span
          className={cn(
            'mt-[5px] flex items-center gap-1 text-[11.5px] font-bold',
            urgent ? 'text-destructive' : 'text-[#b07a00]',
          )}
        >
          <Clock className="size-3" aria-hidden />
          {isExpired ? '마감 종료' : `마감까지 ${label}`}
          <span className="ml-1 font-semibold text-muted-foreground">
            · {deal.stockLeft}개 남음
          </span>
        </span>
      </span>
    </button>
  )
}
