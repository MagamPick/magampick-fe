import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Textarea } from '@/shared/components/ui/textarea'
import { REFUND_REJECT_REASON_MAX } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** approve=전액 환불 확인, reject=거부 사유 입력 */
  mode: 'approve' | 'reject'
  /** 환불 금액 (승인 안내용, 전액) */
  amount: number
  onApprove: () => void
  /** 거부 — trim 된 사유 전달 */
  onReject: (reason: string) => void
  isPending?: boolean
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

const ghostBtn =
  'h-[52px] flex-1 rounded-xl bg-background text-[15px] font-bold text-muted-foreground transition active:scale-[0.98]'

/**
 * 환불 승인/거부 시트 (노션 「환불 승인/거부」).
 * approve = 전액 환불 확인(ConfirmSheet 형), reject = 거부 사유 입력(필수, 소비자 노출).
 * 시트가 닫히면 입력 초기화.
 */
export function RefundDecisionSheet({
  open,
  onOpenChange,
  mode,
  amount,
  onApprove,
  onReject,
  isPending = false,
}: Props) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('')
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
      >
        {mode === 'approve' ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-[18px] font-bold">환불을 승인할까요?</SheetTitle>
              <SheetDescription className="text-[13.5px] leading-relaxed">
                <strong className="text-foreground">{won(amount)}</strong> 전액이 환불돼요. 승인
                후에는 되돌릴 수 없어요.
              </SheetDescription>
            </SheetHeader>
            <div className="flex gap-2.5 px-4 pb-2">
              <button type="button" onClick={() => handleOpenChange(false)} className={ghostBtn}>
                닫기
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={isPending}
                className="h-[52px] flex-1 rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? '처리 중…' : '승인하기'}
              </button>
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="text-[18px] font-bold">환불을 거부할까요?</SheetTitle>
              <SheetDescription className="text-[13.5px] leading-relaxed">
                거부 사유는 <strong className="text-foreground">소비자에게 그대로 보여요</strong>.
                명확하게 적어 주세요.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={REFUND_REJECT_REASON_MAX}
                placeholder="거부 사유를 입력해 주세요"
                className="min-h-[96px] rounded-[12px] text-sm leading-relaxed"
              />
              <div className="mt-1.5 text-right text-[11.5px] font-semibold text-muted-foreground">
                <b className="text-primary">{reason.length}</b> / {REFUND_REJECT_REASON_MAX}자
              </div>
            </div>

            <div className="flex gap-2.5 px-4 pb-2">
              <button type="button" onClick={() => handleOpenChange(false)} className={ghostBtn}>
                닫기
              </button>
              <button
                type="button"
                onClick={() => onReject(trimmed)}
                disabled={trimmed.length === 0 || isPending}
                className="h-[52px] flex-1 rounded-xl bg-destructive text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? '처리 중…' : '거부하기'}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
