import { ChevronRight } from 'lucide-react'

/** 처리 필요 (정적 더미 — 주문 기능 별도) */
const TASKS = [
  { label: '신규 주문', count: '3건', dot: 'bg-primary' },
  { label: '준비 완료 대기', count: '2건', dot: 'bg-warning' },
  { label: '픽업 임박', count: '1건', dot: 'bg-info' },
]

export function HomeTaskCard() {
  return (
    <section className="mx-5 mt-6">
      <h2 className="mb-2.5 text-[15px] font-bold text-foreground">처리 필요</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
        {TASKS.map((task, i) => (
          <div
            key={task.label}
            className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <span className={`size-2 rounded-full ${task.dot}`} />
            <span className="flex-1 text-[14px] font-medium text-foreground">{task.label}</span>
            <span className="text-[14px] font-bold text-primary">{task.count}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </section>
  )
}
