import { cn } from '@/shared/lib/utils'

/** 수수료 안내 항목 (노션 「정산 내역 조회」 — 중개 5.0% / 결제 1.5% / 반월 정산) */
const FEES = [
  { label: '중개 수수료', value: '결제액의 5.0%' },
  { label: '결제 수수료', value: '결제액의 1.5%' },
  { label: '정산 주기', value: '월 2회 · 15일·말일 마감' },
] as const

interface Props {
  className?: string
}

/** 수수료 안내 카드 (프로토타입 42-settlement `.detail-card` 수수료 안내) */
export function FeeGuideCard({ className }: Props) {
  return (
    <section className={cn('rounded-[16px] border border-border bg-card px-[18px] py-4', className)}>
      <h2 className="mb-2.5 text-[13px] font-bold text-muted-foreground">수수료 안내</h2>
      <dl>
        {FEES.map((fee) => (
          <div
            key={fee.label}
            className="flex items-center justify-between gap-3 py-1.5 text-[14px]"
          >
            <dt className="font-semibold text-muted-foreground">{fee.label}</dt>
            <dd className="font-semibold text-foreground">{fee.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
