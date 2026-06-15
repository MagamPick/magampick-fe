import type { ReactNode } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { discountRate } from '../lib/clearanceStatus'

/**
 * 마감 할인(clearance) 카드 — 프레젠테이션 컴포넌트 (프로토타입 DEALS / deal-card).
 * 홈 요약 리스트 + 마감 할인 탭에서 재사용. 조회/동작은 각 기능 PR(노션 명세)에서.
 */
export interface DealCardProps {
  name: string
  /** 사진 없을 때 폴백 아이콘 */
  thumbnail?: ReactNode
  /** 대표 사진 URL — 있으면 이모지 대신 표시 */
  imageUrl?: string
  /** 정가 (원) */
  originalPrice: number
  /** 할인가 (원) */
  salePrice: number
  /** 판매 수량 */
  soldCount: number
  /** 총 수량 */
  totalQty: number
  /** 마감 시각 (HH:MM) */
  closeTime: string
  /** live=진행중 / soon=곧 마감 / ended=마감 */
  status?: 'live' | 'soon' | 'ended'
}

const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`

export function DealCard({
  name,
  thumbnail = <UtensilsCrossed className="size-7 text-muted-foreground" />,
  imageUrl,
  originalPrice,
  salePrice,
  soldCount,
  totalQty,
  closeTime,
  status = 'live',
}: DealCardProps) {
  const rate = discountRate(originalPrice, salePrice)
  const pct = totalQty > 0 ? Math.round((soldCount / totalQty) * 100) : 0
  const closeText =
    status === 'ended' ? '마감 완료' : status === 'soon' ? '곧 마감' : `마감 ${closeTime}`

  return (
    <div className="flex gap-3 rounded-[14px] border border-border bg-card p-3">
      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-secondary text-[30px]">
        {imageUrl ? <img src={imageUrl} alt={name} className="size-full object-cover" /> : thumbnail}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-foreground">{name}</p>
        <p className="mt-0.5 text-[13px]">
          <s className="text-[12px] text-muted-foreground">{won(originalPrice)}</s>{' '}
          <span className="mr-0.5 font-extrabold text-destructive">{rate}%</span>
          <b className="font-extrabold text-primary">{won(salePrice)}</b>
        </p>
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
            <span>
              {soldCount} / {totalQty} 판매
            </span>
            <span className={status === 'soon' ? 'text-destructive' : undefined}>{closeText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
