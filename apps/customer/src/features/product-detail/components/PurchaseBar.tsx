import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { Button } from '@/shared/components/ui/button'
import { getPurchaseState } from '../lib/purchasable'
import type { ProductDetail } from '../types'

/** 일반 상품은 재고 개념이 없어 임의 상한만 둔다 */
const MENU_MAX = 99

/**
 * 하단 고정 바 — 수량 선택(default 1, 떨이는 남은 개수 상한) + 장바구니 담기.
 * 구매 불가(영업 외/판매 OFF/떨이 마감)면 사유 라벨 + 버튼·스텝퍼 비활성.
 * 실제 담기·장바구니 화면은 Phase 5 — 담기 탭 시 "준비 중" 안내(CartBar 와 동일).
 */
export function PurchaseBar({ product }: { product: ProductDetail }) {
  const { show } = useComingSoon()
  // 진입 시점 기준 구매 가능 여부 — 렌더 순수성(Date.now 직접 호출 금지) 위해 lazy 캡처
  const [nowMs] = useState(() => Date.now())
  const [qty, setQty] = useState(1)
  const state = getPurchaseState(product, nowMs)
  const purchasable = state.purchasable
  const max = Math.max(1, product.kind === 'deal' ? product.stockLeft : MENU_MAX)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
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
            className="flex h-12 w-11 items-center justify-center text-foreground disabled:text-[#bdbdbd]"
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
            className="flex h-12 w-11 items-center justify-center text-foreground disabled:text-[#bdbdbd]"
          >
            <Plus className="size-[18px]" aria-hidden />
          </button>
        </div>
        <Button
          type="button"
          disabled={!purchasable}
          onClick={() => show('장바구니는 준비 중이에요.')}
          className="h-12 flex-1 rounded-[12px] text-base font-bold"
        >
          장바구니 담기
        </Button>
      </div>
    </div>
  )
}
