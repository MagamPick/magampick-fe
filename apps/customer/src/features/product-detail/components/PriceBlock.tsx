import type { ProductDetail } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 가격/할인 영역 — 일반=정가, 떨이=할인율·원가(취소선)·할인가 */
export function PriceBlock({ product }: { product: ProductDetail }) {
  if (product.kind === 'menu') {
    return <div className="mt-3 text-2xl font-extrabold text-foreground">{won(product.price)}</div>
  }
  return (
    <div className="mt-3 flex items-baseline gap-[7px]">
      <span className="text-xl font-extrabold text-destructive">{product.discountRate}%</span>
      <span className="text-sm text-[#bdbdbd] line-through">{won(product.originalPrice)}</span>
      <span className="text-2xl font-extrabold text-foreground">{won(product.salePrice)}</span>
    </div>
  )
}
