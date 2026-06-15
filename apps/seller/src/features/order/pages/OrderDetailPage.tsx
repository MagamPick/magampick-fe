import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ChevronLeft, Phone, ReceiptText, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { ConfirmSheet } from '@/shared/components/ConfirmSheet'
import { ErrorState } from '@/shared/components/ErrorState'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useOrder } from '../hooks/useOrder'
import { useOrderActions } from '../hooks/useOrderActions'
import { OrderTimeline } from '../components/OrderTimeline'
import { PickupCodeCard } from '../components/PickupCodeCard'
import {
  ORDER_STATUS_LABEL,
  formatPickup,
  formatPlacedAt,
  statusToSegment,
} from '../lib/orderStatus'
import { orderParamsSchema } from '../types'
import type { OrderSegment } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 상태 배너 색 — 세그먼트별(프로토타입 detail-banner). */
const BANNER_CLASS: Record<OrderSegment, string> = {
  new: 'bg-destructive/10 text-destructive',
  prep: 'bg-warning/10 text-warning-foreground',
  ready: 'bg-info/10 text-info',
  done: 'bg-success/10 text-success',
  cancel: 'bg-muted text-muted-foreground',
}

const ghostBtn =
  'h-[52px] flex-1 rounded-xl bg-background text-[15px] font-bold text-foreground transition active:scale-[0.98] disabled:opacity-60'
const primaryBtn =
  'h-[52px] flex-1 rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60'

/**
 * 사장 주문 상세 (노션 「주문 상세 조회(사장)」, 프로토타입 30-order-detail).
 * 배너·픽업 코드(준비완료 강조)·주문 상품/금액·고객 정보(실제 전화)·요청 메모·4노드 타임라인 + 상태별 CTA.
 * 신규=수락/거절, 준비중=준비 완료로 변경, 준비완료=수령 완료 처리/미수령(확인 시트), 완료·종료=안내만.
 */
export function OrderDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const parsed = orderParamsSchema.safeParse(params)
  const id = parsed.success ? parsed.data.id : ''
  const _storeIdNum = useCurrentStoreStore((s) => s.selectedStoreId)
  // 매장 ID(number)를 URL 보간용 string 으로 변환 (실연동 완료)
  const storeId = _storeIdNum != null ? String(_storeIdNum) : ''

  const { data: order, isLoading, isError, refetch } = useOrder(id)
  const actions = useOrderActions(storeId)

  const [sheet, setSheet] = useState<null | 'reject' | 'noShow'>(null)

  if (!parsed.success) return <Navigate to={ROUTES.ORDERS} replace />

  const segment = order ? statusToSegment(order.status) : 'new'
  const telDigits = order?.customerPhone.replace(/\D/g, '') ?? ''

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card pb-10">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">주문 상세{order ? ` · #${order.orderNo}` : ''}</h1>
      </header>

      {isLoading && (
        <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
      )}

      {!isLoading && (isError || !order) && (
        <ErrorState icon={<ReceiptText />} onRetry={() => refetch()}>
          주문을 찾을 수 없어요.
        </ErrorState>
      )}

      {order && (
        <>
          <div className="px-5 pt-4">
            {/* 상태 배너 */}
            <div
              className={cn(
                'flex items-center justify-between gap-2.5 rounded-[16px] px-[18px] py-[15px]',
                BANNER_CLASS[segment],
              )}
            >
              <span className="text-[17px] font-extrabold tracking-[-0.3px]">
                {ORDER_STATUS_LABEL[order.status]}
              </span>
              <span className="text-right text-[13px] font-bold">
                픽업 예정
                <b className="block text-[16px] font-extrabold">{formatPickup(order.pickupTime)}</b>
              </span>
            </div>

            <PickupCodeCard code={order.pickupCode} status={order.status} />

            {/* 주문 상품 */}
            <section className="mt-3 rounded-[16px] border border-border bg-card px-[18px] py-4">
              <div className="mb-2.5 text-[13px] font-bold text-muted-foreground">주문 상품</div>
              {order.items.map((it, i) => (
                <div key={`${it.name}-${i}`} className="flex items-baseline gap-2 py-1.5">
                  <span className="text-[14px] font-bold text-foreground">{it.name}</span>
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    ×{it.quantity}
                  </span>
                  <span className="ml-auto text-[14px] font-bold text-foreground">
                    {won(it.price * it.quantity)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-[14px] font-bold">결제 금액</span>
                <span className="text-[18px] font-extrabold text-primary">{won(order.total)}</span>
              </div>
            </section>

            {/* 고객 정보 */}
            <section className="mt-3 rounded-[16px] border border-border bg-card px-[18px] py-4">
              <div className="mb-2.5 text-[13px] font-bold text-muted-foreground">고객 정보</div>
              <div className="mb-2.5 flex items-center gap-3 rounded-xl bg-background p-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd9c7] to-[#ffb088]">
                  <User className="size-5 text-secondary-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-foreground">
                    {order.customerName}님
                  </div>
                  <div className="mt-0.5 text-[16px] font-extrabold tracking-[0.2px] text-foreground">
                    {order.customerPhone}
                  </div>
                </div>
                <a
                  href={`tel:${telDigits}`}
                  aria-label="고객에게 전화 걸기"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[20px] bg-primary px-3.5 text-[13px] font-bold text-white transition active:scale-[0.97]"
                >
                  <Phone className="size-4" /> 전화
                </a>
              </div>
              <div className="flex gap-3 py-1.5 text-[14px]">
                <span className="w-16 shrink-0 font-semibold text-muted-foreground">주문 시각</span>
                <span className="font-semibold text-foreground">
                  {formatPlacedAt(order.placedAt)}
                </span>
              </div>
              {order.memo && (
                <div className="mt-2 rounded-[10px] bg-cream px-3.5 py-3 text-[13px] font-semibold leading-relaxed text-foreground">
                  “{order.memo}”
                </div>
              )}
            </section>

            {/* 진행 상태 */}
            <section className="mt-3 rounded-[16px] border border-border bg-card px-[18px] py-4">
              <div className="mb-2.5 text-[13px] font-bold text-muted-foreground">진행 상태</div>
              <OrderTimeline status={order.status} />
            </section>
          </div>

          {/* 상태별 CTA — 내용 흐름 배치(하단 고정 X) */}
          <div className="mt-8 px-5">
            {order.status === 'PENDING' && (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className={ghostBtn}
                  disabled={actions.reject.isPending}
                  onClick={() => setSheet('reject')}
                >
                  거절
                </button>
                <button
                  type="button"
                  className={primaryBtn}
                  disabled={actions.accept.isPending}
                  onClick={() => actions.accept.mutate(id)}
                >
                  주문 수락
                </button>
              </div>
            )}

            {order.status === 'PREPARING' && (
              <button
                type="button"
                className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:opacity-60"
                disabled={actions.ready.isPending}
                onClick={() => actions.ready.mutate(id)}
              >
                준비 완료로 변경
              </button>
            )}

            {order.status === 'READY' && (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className={ghostBtn}
                  disabled={actions.noShow.isPending}
                  onClick={() => setSheet('noShow')}
                >
                  미수령
                </button>
                <button
                  type="button"
                  className={primaryBtn}
                  disabled={actions.complete.isPending}
                  onClick={() => actions.complete.mutate(id)}
                >
                  수령 완료 처리
                </button>
              </div>
            )}

            {(order.status === 'COMPLETED' || segment === 'cancel') && (
              <p className="py-2 text-center text-[14px] font-bold text-muted-foreground">
                처리할 작업이 없어요
              </p>
            )}
          </div>
        </>
      )}

      <ConfirmSheet
        open={sheet === 'reject'}
        onOpenChange={(open) => {
          if (!open) setSheet(null)
        }}
        title="주문을 거절할까요?"
        description="거절하면 고객 결제가 자동으로 취소되고, 이 주문은 취소·환불 내역으로 이동해요."
        confirmLabel={actions.reject.isPending ? '처리 중…' : '주문 거절'}
        onConfirm={() => actions.reject.mutate(id, { onSuccess: () => setSheet(null) })}
        variant="danger"
        isPending={actions.reject.isPending}
      />

      <ConfirmSheet
        open={sheet === 'noShow'}
        onOpenChange={(open) => {
          if (!open) setSheet(null)
        }}
        title="미수령 처리할까요?"
        description="손님이 가져가지 않은 주문이에요. 미수령으로 처리하면 되돌릴 수 없고, 환불은 진행되지 않아요."
        confirmLabel={actions.noShow.isPending ? '처리 중…' : '미수령 처리'}
        onConfirm={() => actions.noShow.mutate(id, { onSuccess: () => setSheet(null) })}
        variant="danger"
        isPending={actions.noShow.isPending}
      />
    </div>
  )
}
