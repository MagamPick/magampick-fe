import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useCartStore } from '../stores/cartStore'
import { calcCartAmounts } from '../lib/calcCartAmounts'
import { CartEmpty } from '../components/CartEmpty'
import { CartItemRow } from '../components/CartItemRow'
import { PickupTimeSelector } from '../components/PickupTimeSelector'
import { CartSummary } from '../components/CartSummary'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 장바구니 (노션: 장바구니 관리, 프로토타입 40-cart).
 * 단일 매장 그룹 + 수량/삭제 + 픽업 시간 선택 + 금액 요약. 결제하기 → 결제 화면(주문 생성).
 */
export function CartPage() {
  const navigate = useNavigate()
  const store = useCartStore((s) => s.store)
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const [clearOpen, setClearOpen] = useState(false)

  const isEmpty = items.length === 0
  const { payTotal } = calcCartAmounts(items)

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">장바구니</h1>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            className="ml-auto px-2.5 text-xs font-bold text-muted-foreground"
          >
            전체 삭제
          </button>
        )}
      </header>

      <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom,24px)+16px)]">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          <>
            <section className="mx-5 mt-3 overflow-hidden rounded-[14px] border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border bg-background px-[14px] py-[13px]">
                <span className="flex-1 text-sm font-extrabold text-foreground">{store?.name}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {store?.closingTime} 마감
                </span>
              </div>
              <div className="px-[14px]">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>

            <PickupTimeSelector />
            <CartSummary items={items} />
          </>
        )}
      </main>

      {!isEmpty && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom,24px))] pt-3">
          <Button
            type="button"
            onClick={() => navigate(ROUTES.CHECKOUT)}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[12px] text-base font-bold"
          >
            결제하기 <span>{won(payTotal)}</span>
          </Button>
        </div>
      )}

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>장바구니를 비울까요?</AlertDialogTitle>
            <AlertDialogDescription>담은 상품이 모두 삭제돼요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => clearCart()}>비우기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScreenContainer>
  )
}
