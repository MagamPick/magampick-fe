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

/**
 * 단일 매장 정책 확인 — 장바구니에 다른 매장 상품을 담을 때 기존 비우기 확인(노션).
 * PurchaseBar 가 제어. 확인 시 onConfirm 에서 교체 담기 + 장바구니 이동.
 */
export function ReplaceCartDialog({
  open,
  onOpenChange,
  currentStoreName,
  newStoreName,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStoreName: string
  newStoreName: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>다른 매장 상품을 담을까요?</AlertDialogTitle>
          <AlertDialogDescription>
            장바구니엔 한 매장 상품만 담을 수 있어요. ‘{currentStoreName}’ 장바구니를 비우고 ‘
            {newStoreName}’ 상품을 담을게요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>비우고 담기</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
