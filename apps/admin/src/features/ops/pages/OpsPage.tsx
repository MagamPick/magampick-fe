import { SettlementCard } from '../components/SettlementCard'
import { SmsMockCard } from '../components/SmsMockCard'

/** 운영 도구 — 위험·일회성 운영 동작(정산 배치 수동 트리거 / SMS 발송 mock 전환). */
export function OpsPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-h2 font-bold text-foreground">운영 도구</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          위험하거나 일회성인 운영 동작을 수동으로 실행합니다.
        </p>
      </header>

      <div className="space-y-6">
        <SettlementCard />
        <SmsMockCard />
      </div>
    </section>
  )
}
