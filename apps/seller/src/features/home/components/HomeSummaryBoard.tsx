/** 오늘 매출 보드 (정적 더미 — 통계 기능 별도) */
const COLS = [
  { label: '오늘 매출', value: '₩342,000', accent: true },
  { label: '오늘 주문', value: '18건' },
  { label: '픽업 완료율', value: '94%' },
]

export function HomeSummaryBoard() {
  return (
    <section className="mx-5 mt-6">
      <div className="flex items-stretch rounded-xl border border-border bg-card px-2 py-4 shadow-e1">
        {COLS.map((col, i) => (
          <div
            key={col.label}
            className={`flex flex-1 flex-col items-center gap-1.5 ${i > 0 ? 'border-l border-border' : ''}`}
          >
            <span className="text-[11.5px] font-medium text-muted-foreground">{col.label}</span>
            <span className={`text-[17px] font-bold ${col.accent ? 'text-primary' : 'text-foreground'}`}>
              {col.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
