import { cn } from '@/shared/lib/utils'

/**
 * 일반 상품(product) 카드 — 프레젠테이션 컴포넌트 (프로토타입 PRODUCTS / product-card).
 * 홈 메뉴 요약 + 추후 상품 탭에서 재사용. 조회/동작은 각 기능 PR(노션 명세)에서.
 * - `showCategory`: 평면 리스트(상품 탭)는 카드에 카테고리 표시, 카테고리 그룹 뷰(홈)는 헤더에 두고 숨김.
 */
export interface ProductCardProps {
  name: string
  /** mock 썸네일 이모지 (실연동: 이미지 URL) */
  thumbnail?: string
  /** 카테고리 (음료 / 베이커리 / 디저트 …) */
  category: string
  /** 판매가 (원) */
  price: number
  soldOut?: boolean
  /** 마감 할인 진행 여부 */
  hasDeal?: boolean
  /** 카드 안에 카테고리 표시 여부 (기본 true; 그룹 뷰에선 false) */
  showCategory?: boolean
}

const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`

export function ProductCard({
  name,
  thumbnail = '🍽️',
  category,
  price,
  soldOut = false,
  hasDeal = false,
  showCategory = true,
}: ProductCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-3">
      <div className={cn('flex min-w-0 flex-1 items-center gap-3', soldOut && 'opacity-45')}>
        <span className="flex size-[58px] shrink-0 items-center justify-center rounded-[10px] bg-secondary text-[27px]">
          {thumbnail}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-foreground">{name}</p>
          {showCategory && <p className="mt-0.5 text-[12px] text-muted-foreground">{category}</p>}
          <p className="mt-1 text-[14px] font-extrabold text-foreground">{won(price)}</p>
          {hasDeal && <p className="mt-1 text-[11px] font-bold text-primary">🔥 마감 할인 진행중</p>}
        </div>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold',
          soldOut ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success',
        )}
      >
        {soldOut ? '품절' : '판매중'}
      </span>
    </div>
  )
}
