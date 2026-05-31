/** 빠른 액션 — 메뉴 등록 / 마감 할인 등록 (정적 inert — 대상 화면 별도) */
const ACTIONS = [
  { icon: '➕', label: '메뉴 등록', sub: '새 상품을 추가해요' },
  { icon: '🔥', label: '마감 할인 등록', sub: '마감 세일 시작' },
]

export function HomeQuickActions() {
  return (
    <section className="mx-5 mt-6 flex gap-2.5">
      {ACTIONS.map((action) => (
        <div
          key={action.label}
          className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-e1"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-[19px] text-primary">
            {action.icon}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[13.5px] font-semibold text-foreground">{action.label}</span>
            <span className="truncate text-[11.5px] font-medium text-muted-foreground">{action.sub}</span>
          </span>
        </div>
      ))}
    </section>
  )
}
