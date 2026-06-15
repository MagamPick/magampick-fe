import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { ReplaceCartDialog } from '@/features/cart/components/ReplaceCartDialog'
import { getPurchaseState } from '../lib/purchasable'
import type { ProductDetail } from '../types'

/** 일반 상품은 재고 개념이 없어 임의 상한만 둔다 */
const MENU_MAX = 99

/**
 * 하단 고정 바 — 수량 선택(default 1, 떨이는 남은 개수 상한) + 장바구니 담기.
 * 구매 불가(영업 외/판매 OFF/떨이 마감)면 사유 라벨 + 버튼·스텝퍼 비활성.
 * 담기: 단일 매장 정책 — 다른 매장 상품이 담겨 있으면 확인 후 비우고 담은 뒤 장바구니로 이동.
 */
export function PurchaseBar({ product }: { product: ProductDetail }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const cartStore = useCartStore((s) => s.store)
  const cartItemCount = useCartStore((s) => s.items.length)

  // 진입 시점 기준 구매 가능 여부 — 렌더 순수성(Date.now 직접 호출 금지) 위해 lazy 캡처
  const [nowMs] = useState(() => Date.now())
  const [qty, setQty] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const state = getPurchaseState(product, nowMs)
  const purchasable = state.purchasable
  const max = Math.max(1, product.kind === 'deal' ? product.stockLeft : MENU_MAX)

  // cart 스토어는 string id — product의 number id를 경계에서 변환
  const storeCtx = {
    id: String(product.storeId),
    name: product.storeName,
    closingTime: product.closingTime ?? '21:00',
  }
  const cartItem = {
    id: String(product.id),
    kind: product.kind,
    name: product.name,
    imageUrl: product.imageUrl,
    originalPrice: product.kind === 'deal' ? product.originalPrice : product.price,
    salePrice: product.kind === 'deal' ? product.salePrice : product.price,
  }

  const commitAdd = () => {
    addItem({ store: storeCtx, item: cartItem, qty })
    navigate(ROUTES.CART)
  }

  const handleAdd = () => {
    // 단일 매장 정책 — 다른 매장 상품이 담겨 있으면 확인 후 교체
    const conflict = cartStore != null && cartStore.id !== storeCtx.id && cartItemCount > 0
    if (conflict) setConfirmOpen(true)
    else commitAdd()
  }

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
      {!purchasable && (
        <p className="mb-2 text-center text-[13px] font-semibold text-destructive">{state.reason}</p>
      )}
      <div className="flex items-center gap-3">
        <div className="flex flex-shrink-0 items-center gap-1 rounded-[11px] border-[1.5px] border-border">
          <button
            type="button"
            aria-label="수량 감소"
            disabled={!purchasable || qty <= 1}
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            className="flex h-12 w-11 items-center justify-center text-foreground disabled:text-placeholder"
          >
            <Minus className="size-[18px]" aria-hidden />
          </button>
          <span
            aria-label="수량"
            aria-live="polite"
            className="w-7 text-center text-[15px] font-extrabold tabular-nums"
          >
            {qty}
          </span>
          <button
            type="button"
            aria-label="수량 증가"
            disabled={!purchasable || qty >= max}
            onClick={() => setQty((v) => Math.min(max, v + 1))}
            className="flex h-12 w-11 items-center justify-center text-foreground disabled:text-placeholder"
          >
            <Plus className="size-[18px]" aria-hidden />
          </button>
        </div>
        <Button
          type="button"
          disabled={!purchasable}
          onClick={handleAdd}
          className="h-12 flex-1 rounded-[12px] text-base font-bold"
        >
          장바구니 담기
        </Button>
      </div>

      <ReplaceCartDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        currentStoreName={cartStore?.name ?? ''}
        newStoreName={storeCtx.name}
        onConfirm={commitAdd}
      />
    </div>
  )
}
