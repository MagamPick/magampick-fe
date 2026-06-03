import type { ReactNode } from 'react'

/** 결제 화면 섹션 박스 (프로토타입 .checkout-section) — 제목 + 우측 액션 + 본문 */
export function CheckoutSection({
  title,
  action,
  children,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mx-5 mt-3 rounded-[14px] border border-border bg-card px-4 py-[14px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
