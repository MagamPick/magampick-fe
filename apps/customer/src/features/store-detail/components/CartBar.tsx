import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useCartCount } from '@/features/cart/stores/cartStore'

/**
 * 하단 고정 "장바구니 보기" — 전체 장바구니 수량. 탭 시 장바구니 화면으로 이동.
 * 영업 외 상태에서도 노출 유지(다른 매장 장바구니 진입 가능).
 */
export function CartBar() {
  const navigate = useNavigate()
  const count = useCartCount()

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
      <Button
        type="button"
        onClick={() => navigate(ROUTES.CART)}
        className="h-[54px] w-full rounded-[12px] text-base font-bold"
      >
        <ShoppingCart className="size-5" aria-hidden />
        장바구니 보기{count > 0 ? ` (${count})` : ''}
      </Button>
    </div>
  )
}
