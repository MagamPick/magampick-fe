import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  /** danger=파괴적 액션(삭제 등) → 빨간 확인 버튼 */
  variant?: 'primary' | 'danger'
  cancelLabel?: string
  isPending?: boolean
}

/**
 * 확인 바텀 시트 — 파괴적/되돌릴 수 없는 액션(조기 마감·삭제 등) 공통 (프로토타입 .sheet 확인 시트).
 * 시트 인프라는 공용 Sheet(radix) 재사용.
 */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  variant = 'primary',
  cancelLabel = '닫기',
  isPending = false,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">{title}</SheetTitle>
          <SheetDescription className="text-[13.5px] leading-relaxed">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2.5 px-4 pb-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[52px] flex-1 rounded-xl bg-background text-[15px] font-bold text-muted-foreground transition active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              'h-[52px] flex-1 rounded-xl text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60',
              variant === 'danger' ? 'bg-destructive' : 'bg-primary',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
