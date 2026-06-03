import { cn } from '@/shared/lib/utils'
import type { ProductSaleStatus } from '../types'

/**
 * 일반 상품(product) 카드 — 프레젠테이션 컴포넌트 (프로토타입 product-card).
 * 상품 목록에서 사용. 조회/동작은 각 기능 PR(노션 명세)에서.
 * - `imageUrl`: 대표 사진(mock dataURL). 없으면 `thumbnail` 이모지 폴백.
 * - `status`: 일반 상품은 onSale/offSale (수량 없음), soldOut 은 떨이(수량 소진) 컨텍스트용.
 * - `showCategory`: 평면 리스트는 표시, 카테고리 그룹 뷰(홈)에선 false 로 숨김.
 */
export interface ProductCardProps {
  name: string
  /** mock 썸네일 이모지 (사진 없을 때 폴백) */
  thumbnail?: string
  /** 대표 사진 URL — 있으면 이모지 대신 표시 */
  imageUrl?: string
  /** 카테고리 (음료 / 베이커리 / 디저트 …) */
  category: string
  /** 정상가 (원) */
  price: number
  /** 판매 상태 (기본 판매중) */
  status?: ProductSaleStatus
  /** 마감 할인 진행 여부 */
  hasDeal?: boolean
  /** 카드 안에 카테고리 표시 여부 (기본 true; 그룹 뷰에선 false) */
  showCategory?: boolean
}

const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`

const STATUS_BADGE: Record<ProductSaleStatus, { label: string; className: string }> = {
  onSale: { label: '판매중', className: 'bg-success/10 text-success' },
  offSale: { label: '판매중지', className: 'bg-muted text-muted-foreground' },
  soldOut: { label: '품절', className: 'bg-muted text-muted-foreground' },
}

export function ProductCard({
  name,
  thumbnail = '🍽️',
  imageUrl,
  category,
  price,
  status = 'onSale',
  hasDeal = false,
  showCategory = true,
}: ProductCardProps) {
  const badge = STATUS_BADGE[status]

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-3">
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3',
          status !== 'onSale' && 'opacity-45',
        )}
      >
        <span className="flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-secondary text-[27px]">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="size-full object-cover" />
          ) : (
            thumbnail
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-foreground">{name}</p>
          {showCategory && <p className="mt-0.5 text-[12px] text-muted-foreground">{category}</p>}
          <p className="mt-1 text-[14px] font-extrabold text-foreground">{won(price)}</p>
          {hasDeal && (
            <p className="mt-1 text-[11px] font-bold text-primary">🔥 마감 할인 진행중</p>
          )}
        </div>
      </div>
      <span
        className={cn('shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold', badge.className)}
      >
        {badge.label}
      </span>
    </div>
  )
}
