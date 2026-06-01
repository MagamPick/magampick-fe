import { useNavigate, useSearchParams } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ROUTES } from '@/shared/lib/routes'
import { useOrders } from '../hooks/useOrders'
import { CustomerOrderCard } from '../components/CustomerOrderCard'
import { PICKUP_WAITING_STATUSES, DONE_STATUSES, type Order } from '../types'

type Segment = 'all' | 'waiting' | 'done'

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'waiting', label: '픽업 대기' },
  { value: 'done', label: '완료' },
]

function filterOrders(orders: Order[], segment: Segment): Order[] {
  if (segment === 'waiting') return orders.filter((o) => PICKUP_WAITING_STATUSES.includes(o.status))
  if (segment === 'done') return orders.filter((o) => DONE_STATUSES.includes(o.status))
  return orders
}

export function OrderListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const segment = (searchParams.get('segment') ?? 'all') as Segment
  const setSegment = (s: Segment) =>
    setSearchParams(s === 'all' ? {} : { segment: s }, { replace: true })

  const { data: orders, isLoading } = useOrders()
  const visible = filterOrders(orders ?? [], segment)

  return (
    <ScreenContainer variant="tab" className="pt-[env(safe-area-inset-top,0px)]">
      <header className="flex h-[52px] items-center px-5">
        <h1 className="text-[18px] font-extrabold text-foreground">주문 내역</h1>
      </header>

      {/* 세그먼트 탭 */}
      <div className="flex border-b border-border bg-card" role="tablist" aria-label="주문 상태">
        {SEGMENTS.map((s) => {
          const on = segment === s.value
          return (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSegment(s.value)}
              className={cn(
                'flex-1 border-b-2 py-3 text-[14px] transition',
                on
                  ? 'border-primary font-bold text-foreground'
                  : 'border-transparent font-semibold text-muted-foreground',
              )}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* 목록 */}
      <div className="flex flex-col gap-2.5 px-4 py-4 pb-6">
        {isLoading && (
          <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
        )}

        {!isLoading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <span className="text-[40px]">🧾</span>
            <p className="text-[14px] text-muted-foreground">주문 내역이 없어요.</p>
          </div>
        )}

        {visible.map((order) => (
          <CustomerOrderCard
            key={order.id}
            order={order}
            onClick={() => navigate(ROUTES.ORDER_DETAIL(order.id))}
            onReviewClick={() => navigate(ROUTES.REVIEW_WRITE(order.id))}
          />
        ))}
      </div>
    </ScreenContainer>
  )
}
