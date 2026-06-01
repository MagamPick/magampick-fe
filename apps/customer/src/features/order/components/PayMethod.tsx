/** 결제 수단 — 토스페이 단일(노션). 선택 고정 표시(프로토타입 .pay-method.on) */
export function PayMethod() {
  return (
    <div className="flex w-full items-center gap-[11px] rounded-[12px] border-[1.5px] border-primary bg-secondary px-[14px] py-[14px] text-left">
      <span
        className="flex size-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white text-lg"
        aria-hidden
      >
        🅣
      </span>
      <span className="flex-1 text-sm font-bold text-foreground">토스페이</span>
      <span className="flex size-[22px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary">
        <span className="size-3 rounded-full bg-primary" />
      </span>
    </div>
  )
}
