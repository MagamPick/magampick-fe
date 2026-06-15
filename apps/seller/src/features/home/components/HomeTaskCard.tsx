import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useOrders } from '@/features/order/hooks/useOrders'
import { formatUnit } from '@/features/analytics/lib/analyticsFormat'
import type { OrderSegment, OrderStatus } from '@/features/order/types'

/**
 * 처리 필요 — 현재 매장의 상태별 주문 카운트 (신규=PENDING / 준비중=PREPARING / 픽업 대기=READY).
 * 각 행 탭 → 주문 관리 화면의 해당 세그먼트(/orders?seg=...)로 이동.
 */
export function HomeTaskCard() {
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const storeId = selectedStoreId != null ? String(selectedStoreId) : ''
  const { data: orders } = useOrders(storeId)

  const countOf = (status: OrderStatus) =>
    (orders ?? []).filter((o) => o.status === status).length

  const tasks: { label: string; status: OrderStatus; seg: OrderSegment; dot: string }[] = [
    { label: '신규 주문', status: 'PENDING', seg: 'new', dot: 'bg-primary' },
    { label: '준비 완료 대기', status: 'PREPARING', seg: 'prep', dot: 'bg-warning' },
    { label: '픽업 대기', status: 'READY', seg: 'ready', dot: 'bg-info' },
  ]

  return (
    <section className="mx-5 mt-6">
      <h2 className="mb-2.5 text-[15px] font-bold text-foreground">처리 필요</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
        {tasks.map((task, i) => (
          <Link
            key={task.label}
            to={`${ROUTES.ORDERS}?seg=${task.seg}`}
            className={`flex items-center gap-3 px-4 py-3.5 transition active:bg-muted ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <span className={`size-2 rounded-full ${task.dot}`} />
            <span className="flex-1 text-[14px] font-medium text-foreground">{task.label}</span>
            <span className="text-[14px] font-bold text-primary">
              {formatUnit(countOf(task.status), '건')}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  )
}
