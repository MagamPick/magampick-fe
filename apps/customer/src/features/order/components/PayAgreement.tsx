import { Checkbox } from '@/shared/components/ui/checkbox'

/** 결제 동의 (노션: 필수). 체크해야 결제 가능 */
export function PayAgreement({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="mx-5 mt-3.5 flex cursor-pointer items-start gap-2.5 rounded-[12px] border border-border bg-card px-[14px] py-[13px]">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        aria-label="결제 동의"
        className="mt-0.5"
      />
      <span className="flex-1 text-[13px] leading-[1.55] text-foreground">
        주문 정보를 확인했으며 <b className="font-bold text-primary">결제 진행에 동의합니다</b>. 매장
        마감 후에는 픽업이 어려워 환불이 제한될 수 있어요.
      </span>
    </label>
  )
}
