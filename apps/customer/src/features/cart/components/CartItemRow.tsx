import { Minus, Plus, X } from 'lucide-react'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { useCartStore } from '../stores/cartStore'
import { CART_QTY_MAX, CART_QTY_MIN, type CartItem } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 장바구니 한 줄 — 썸네일·이름·가격(떨이: 할인율+원가취소선+할인가 / 일반: 정가)·수량 ±·삭제.
 * 수량/삭제는 cartStore 직접 반영(노션: 수량 1~10·삭제).
 */
export function CartItemRow({ item }: { item: CartItem }) {
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const isDeal = item.kind === 'deal'
  const discountRate = isDeal
    ? Math.round((1 - item.salePrice / item.originalPrice) * 100)
    : 0

  return (
    <div className="flex items-start gap-[11px] border-b border-border py-[13px] last:border-b-0">
      <Thumbnail
        src={item.imageUrl}
        className="size-[60px] flex-shrink-0 rounded-[11px]"
        iconClassName="size-7"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="line-clamp-2 flex-1 text-sm font-bold leading-[1.35] [word-break:keep-all]">
            {item.name}
          </p>
          <button
            type="button"
            aria-label="삭제"
            onClick={() => removeItem(item.id)}
            className="flex size-7 flex-shrink-0 items-center justify-center text-[#bdbdbd]"
          >
            <X className="size-[18px]" aria-hidden />
          </button>
        </div>

        <div className="mt-1.5 flex items-baseline gap-[5px]">
          {isDeal && (
            <>
              <span className="text-[12.5px] font-extrabold text-destructive">{discountRate}%</span>
              <span className="text-[11px] text-[#bdbdbd] line-through">{won(item.originalPrice)}</span>
            </>
          )}
          <span className="text-[15px] font-extrabold text-foreground">{won(item.salePrice)}</span>
        </div>

        <div className="mt-2 flex justify-end">
          <div className="inline-flex items-center rounded-[9px] border-[1.5px] border-border">
            <button
              type="button"
              aria-label="수량 감소"
              disabled={item.qty <= CART_QTY_MIN}
              onClick={() => updateQty(item.id, item.qty - 1)}
              className="flex h-11 w-8 items-center justify-center text-foreground disabled:text-[#bdbdbd]"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span
              aria-label="수량"
              aria-live="polite"
              className="w-7 text-center text-[13px] font-extrabold tabular-nums"
            >
              {item.qty}
            </span>
            <button
              type="button"
              aria-label="수량 증가"
              disabled={item.qty >= CART_QTY_MAX}
              onClick={() => updateQty(item.id, item.qty + 1)}
              className="flex h-11 w-8 items-center justify-center text-foreground disabled:text-[#bdbdbd]"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
