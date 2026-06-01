import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

/** 주문 취소 확인 시트 (노션: 주문 취소 — PENDING 상태에서만 가능) */
export function CancelOrderSheet({ open, onOpenChange, onConfirm, isPending = false }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">주문을 취소할까요?</SheetTitle>
          <SheetDescription className="text-[13.5px] leading-relaxed">
            사장님이 주문을 수락하기 전에만 취소할 수 있어요.
            <br />
            결제 금액은 영업일 기준 <strong className="text-foreground">3~5일 이내</strong>에
            환불돼요.
          </SheetDescription>
        </SheetHeader>

        <div className="mx-4 mb-3 rounded-xl bg-muted/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
          · 사용한 쿠폰·포인트는 환원돼요.
          <br />· 이미 사장님이 수락한 주문은 매장에 직접 연락해 주세요.
        </div>

        <div className="flex gap-2.5 px-4 pb-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[52px] flex-1 rounded-xl bg-background text-[15px] font-bold text-muted-foreground transition active:scale-[0.98]"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-[52px] flex-1 rounded-xl bg-destructive text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? '취소 중…' : '주문 취소하기'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
