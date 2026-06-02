import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Textarea } from '@/shared/components/ui/textarea'
import { REFUND_REASON_MAX } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 사유와 함께 환불 요청 확정 (trim 된 사유 전달) */
  onConfirm: (reason: string) => void
  /** 환불 예정 금액 (전액 — 노션: 부분 환불 없음) */
  amount: number
  isPending?: boolean
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/**
 * 환불 요청 시트 (노션 「환불 요청」) — 사유 입력(필수) + 전액 안내.
 * 사장 승인 후 처리. 시트 닫히면 입력 초기화. 주문 취소 시트(CancelOrderSheet)와 동형 + 사유 textarea.
 */
export function RefundRequestSheet({
  open,
  onOpenChange,
  onConfirm,
  amount,
  isPending = false,
}: Props) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const canSubmit = trimmed.length > 0 && !isPending

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
        <SheetHeader>
          <SheetTitle className="text-[18px] font-bold">환불을 요청할까요?</SheetTitle>
          <SheetDescription className="text-[13.5px] leading-relaxed">
            <strong className="text-foreground">{won(amount)}</strong> 전액 환불로 요청돼요. 사장님
            승인 후 영업일 기준 <strong className="text-foreground">3~5일 이내</strong>에 환불돼요.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <label
            htmlFor="refund-reason"
            className="mb-1.5 block text-[13px] font-bold text-foreground"
          >
            환불 사유 <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={REFUND_REASON_MAX}
            placeholder="환불 사유를 입력해 주세요 (사장님에게 전달돼요)"
            className="min-h-[96px] rounded-[12px] text-sm leading-relaxed"
          />
          <div className="mt-1.5 text-right text-[11.5px] font-semibold text-[#bdbdbd]">
            <b className="text-primary">{reason.length}</b> / {REFUND_REASON_MAX}자
          </div>
        </div>

        <div className="mx-4 mb-3 rounded-xl bg-muted/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
          · 환불은 전액 기준이며 부분 환불은 안 돼요.
          <br />· 한 주문당 한 번만 요청할 수 있어요.
        </div>

        <div className="flex gap-2.5 px-4 pb-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="h-[52px] flex-1 rounded-xl bg-background text-[15px] font-bold text-muted-foreground transition active:scale-[0.98]"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={!canSubmit}
            className="h-[52px] flex-1 rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? '요청 중…' : '환불 요청하기'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
