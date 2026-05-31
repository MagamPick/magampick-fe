import { Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import type { StoreDeal } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 마감 할인 탭의 떨이 행 — 실시간 카운트다운. 영업 외면 dim + 담기 차단 안내 */
export function DealItem({ deal, orderable }: { deal: StoreDeal; orderable: boolean }) {
  const { show } = useComingSoon()
  const { label, isExpired, remainingMs } = useCountdown(deal.pickupDeadline)
  const urgent = !isExpired && remainingMs <= 10 * 60_000

  const handleTap = () =>
    show(orderable ? '상품 상세는 준비 중이에요.' : '지금은 주문할 수 없는 매장이에요.')

  return (
    <button
      type="button"
      onClick={handleTap}
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
