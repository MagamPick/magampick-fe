import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { ConfirmSheet } from '@/shared/components/ConfirmSheet'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useOrders } from '../hooks/useOrders'
import { useOrderActions } from '../hooks/useOrderActions'
import { OrderCard } from '../components/OrderCard'
import { statusToSegment } from '../lib/orderStatus'
import { ORDER_SEGMENTS } from '../types'
import type { Order, OrderSegment } from '../types'

const SEG_LABEL: Record<OrderSegment, string> = {
  new: '신규',
  prep: '준비중',
  ready: '준비완료',
  done: '완료',
  cancel: '취소·환불',
}

const SEG_EMPTY: Record<OrderSegment, string> = {
  new: '새로 들어온 주문이 없어요.',
  prep: '준비 중인 주문이 없어요.',
  ready: '준비 완료된 주문이 없어요.',
  done: '완료된 주문이 없어요.',
  cancel: '취소·환불 내역이 없어요.',
}

/** 검색 매칭 — 주문번호 / 고객명 / 상품명 (노션: 카드 텍스트 필터) */
function matchesQuery(order: Order, q: string): boolean {
  if (order.orderNo.toLowerCase().includes(q)) return true
  if (order.customerName.toLowerCase().includes(q)) return true
  return order.items.some((it) => it.name.toLowerCase().includes(q))
}

/**
 * 매장 주문 목록 (사장) — 5세그먼트 + 검색 + 건수 뱃지 (노션 「매장 주문 목록 조회(사장)」).
 * 신규=수락/거절, 준비중=준비 완료로 변경, 준비완료=수령 완료 처리 인라인 액션(노션 진입점=목록+상세).
 * 거절은 확인 시트(자동환불), 미수령은 상세에서만. 카드 본문 탭 → 주문 상세.
 */
export function OrderListPage() {
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const segParam = searchParams.get('seg')
  const seg: OrderSegment = (ORDER_SEGMENTS as readonly string[]).includes(segParam ?? '')
    ? (segParam as OrderSegment)
    : 'new'
  const setSeg = (next: OrderSegment) =>
    setSearchParams(next === 'new' ? {} : { seg: next }, { replace: true })

  const { data: orders, isPending, isError, refetch } = useOrders(storeId)
  const actions = useOrderActions(storeId)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [rejectId, setRejectId] = useState<string | null>(null)

  const all = orders ?? []
  const countNew = all.filter((o) => o.status === 'PENDING').length
  const countPrep = all.filter((o) => o.status === 'PREPARING').length
  const badge: Partial<Record<OrderSegment, number>> = { new: countNew, prep: countPrep }

  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const inSeg = all.filter((o) => statusToSegment(o.status) === seg)
  const visible = searching ? inSeg.filter((o) => matchesQuery(o, q)) : inSeg

  const ghostBtn =
    'h-11 flex-1 rounded-xl bg-background text-[14px] font-bold text-foreground transition active:scale-[0.98] disabled:opacity-60'
  const primaryBtn =
    'h-11 flex-1 rounded-xl bg-primary text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60'

  function renderActions(o: Order) {
    if (o.status === 'PENDING')
      return (
        <>
          <button
            type="button"
            className={ghostBtn}
            disabled={actions.reject.isPending}
            onClick={() => setRejectId(o.id)}
          >
            거절
          </button>
          <button
            type="button"
            className={primaryBtn}
            disabled={actions.accept.isPending}
            onClick={() => actions.accept.mutate(o.id)}
          >
            수락
          </button>
        </>
      )
    if (o.status === 'PREPARING')
      return (
        <button
          type="button"
          className={primaryBtn}
          disabled={actions.ready.isPending}
          onClick={() => actions.ready.mutate(o.id)}
        >
          준비 완료로 변경
        </button>
      )
    if (o.status === 'READY')
      return (
        <button
          type="button"
          className={primaryBtn}
          disabled={actions.complete.isPending}
          onClick={() => actions.complete.mutate(o.id)}
        >
          수령 완료 처리
        </button>
      )
    return undefined
  }

  return (
    <ScreenContainer variant="tab">
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-card px-2">
        {searchOpen ? (
          <div className="flex w-full items-center gap-2 px-2">
            <Search className="size-[18px] shrink-0 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="주문번호 또는 고객명 검색"
              className="h-9 flex-1 bg-transparent text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              aria-label="검색 닫기"
              onClick={() => {
                setSearchOpen(false)
                setQuery('')
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            >
              <X className="size-[18px]" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="px-3 text-[16px] font-bold">주문 관리</h1>
            <button
              type="button"
              aria-label="주문 검색"
              onClick={() => setSearchOpen(true)}
              className="ml-auto flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
            >
              <Search className="size-[21px]" />
            </button>
          </>
        )}
      </header>

      <div
        role="tablist"
        aria-label="주문 상태"
        className="flex gap-0.5 overflow-x-auto border-b border-border bg-card px-2 [&::-webkit-scrollbar]:hidden"
      >
        {ORDER_SEGMENTS.map((value) => {
          const on = seg === value
          const count = badge[value]
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSeg(value)}
              className={cn(
                'relative flex shrink-0 items-center gap-1 whitespace-nowrap px-[9px] py-[13px] text-[14px] transition',
                on
                  ? 'font-bold text-primary after:absolute after:inset-x-1.5 after:bottom-0 after:h-[2.5px] after:rounded after:bg-primary'
                  : 'font-semibold text-muted-foreground',
              )}
            >
              {SEG_LABEL[value]}
              {count != null && count > 0 && (
                <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-[9px] bg-primary px-1.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-4">
        {isPending && <ListRowSkeleton className="py-2" />}

        {!isPending && isError && (
          <ErrorState onRetry={() => refetch()}>주문 목록을 불러오지 못했어요.</ErrorState>
        )}

        {!isPending &&
          !isError &&
          visible.length === 0 &&
          (searching ? (
            <EmptyState icon="🔍">
              검색 결과가 없어요.
              <br />
              다른 키워드로 검색해 보세요.
            </EmptyState>
          ) : (
            <EmptyState icon="🧾">{SEG_EMPTY[seg]}</EmptyState>
          ))}

        {visible.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            onSelect={() => navigate(ROUTES.ORDER_DETAIL(o.id))}
            actions={renderActions(o)}
          />
        ))}
      </div>

      <ConfirmSheet
        open={rejectId !== null}
        onOpenChange={(open) => {
          if (!open) setRejectId(null)
        }}
        title="주문을 거절할까요?"
        description="거절하면 고객 결제가 자동으로 취소되고, 이 주문은 취소·환불 내역으로 이동해요."
        confirmLabel={actions.reject.isPending ? '처리 중…' : '주문 거절'}
        onConfirm={() => {
          if (rejectId) actions.reject.mutate(rejectId, { onSuccess: () => setRejectId(null) })
        }}
        variant="danger"
        isPending={actions.reject.isPending}
      />
    </ScreenContainer>
  )
}
