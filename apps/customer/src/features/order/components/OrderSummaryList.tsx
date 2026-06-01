import type { CartItem } from '@/features/cart/types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 주문 상품 요약 목록 (프로토타입 .order-list) — 상품명 ×수량 / 결제단가×수량 */
export function OrderSummaryList({ items }: { items: CartItem[] }) {
  return (
    <div className="text-[13px]">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between gap-3 py-[7px] text-muted-foreground">
          <span className="min-w-0 flex-1 truncate">
            {item.name} <span className="text-[#bdbdbd]">×{item.qty}</span>
          </span>
          <b className="font-bold text-foreground">{won(item.salePrice * item.qty)}</b>
        </div>
      ))}
    </div>
  )
}
