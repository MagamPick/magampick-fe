import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { ROUTES } from '@/shared/lib/routes'
import type { SearchProductItem } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 상품 결과 행 — 썸네일 + 상품명 + (매장명·가격). 탭 → 상품 상세(`/product/:kind/:id`).
 * 전체 매장 카드(StoreListCard)와 동일한 행 패턴(썸네일 64·border-b).
 */
export function ProductResultRow({ product }: { product: SearchProductItem }) {
  const navigate = useNavigate()
  const meta =
    product.kind === 'deal'
      ? `${product.storeName} · ${product.discountRate}% 할인 · ${won(product.salePrice)}`
      : `${product.storeName} · ${won(product.price)}`
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.PRODUCT_DETAIL(product.kind, product.id))}
      className="flex w-full items-center gap-3 border-b border-border py-[13px] text-left last:border-b-0"
    >
      <Thumbnail
        src={product.imageUrl}
        className="size-16 flex-shrink-0 rounded-[12px]"
        iconClassName="size-7"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{product.name}</span>
        <span className="mt-[3px] block truncate text-xs text-muted-foreground">{meta}</span>
      </span>
      <ChevronRight className="size-[18px] flex-shrink-0 text-placeholder" aria-hidden />
    </button>
  )
}
