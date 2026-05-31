import { ShoppingCart } from 'lucide-react'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { Button } from '@/shared/components/ui/button'

/**
 * 하단 고정 "장바구니 보기" — 전체 장바구니 항목 수.
 * 영업 외 상태에서도 노출 유지(다른 매장 장바구니 진입). 장바구니 화면은 Phase 5 — 탭 시 안내.
 */
export function CartBar({ count = 0 }: { count?: number }) {
  const { show } = useComingSoon()
  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
      <Button
        type="button"
        onClick={() => show('장바구니는 준비 중이에요.')}
        className="h-[54px] w-full rounded-[12px] text-base font-bold"
      >
        <ShoppingCart className="size-5" aria-hidden />
        장바구니 보기{count > 0 ? ` (${count})` : ''}
      </Button>
    </div>
  )
}
