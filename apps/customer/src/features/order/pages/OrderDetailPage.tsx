import { useState } from 'react'
import { z } from 'zod'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { useOrder } from '../hooks/useOrder'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { useRequestRefund } from '../hooks/useRequestRefund'
import { OrderStepper } from '../components/OrderStepper'
import { CancelOrderSheet } from '../components/CancelOrderSheet'
import { RefundRequestSheet } from '../components/RefundRequestSheet'
import { canRequestRefund, REFUND_STATUS_LABEL } from '../lib/refundPolicy'
import { PICKUP_WAITING_STATUSES, type Refund } from '../types'

const paramsSchema = z.object({ id: z.string().min(1) })
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

export function OrderDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const parsed = paramsSchema.safeParse(params)
  const id = parsed.success ? parsed.data.id : ''

  const { data: order, isLoading, isError } = useOrder(id)
  const cancel = useCancelOrder(id)
  const refund = useRequestRefund(id)
  const addItem = useCartStore((s) => s.addItem)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  const showCode = order && PICKUP_WAITING_STATUSES.includes(order.status)
  const pickupLabel = order?.pickup.type === 'asap' ? '가능한 빨리' : `오늘 ${order?.pickup.time}`

  const hasCta =
    order &&
    (order.status === 'PENDING' ||
      order.status === 'PREPARING' ||
      order.status === 'READY' ||
      order.status === 'COMPLETED')

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => {
        setCancelOpen(false)
        navigate(ROUTES.ORDERS)
      },
    })
  }

  const handleRequestRefund = (reason: string) => {
    refund.mutate(reason, { onSuccess: () => setRefundOpen(false) })
  }

  const handleReorder = () => {
    if (!order) return
    order.items.forEach((item) =>
      addItem({
        store: { id: order.storeId, name: order.storeName, closingTime: '23:59' },
        item: {
          id: item.id,
          kind: item.kind,
          name: item.name,
          imageUrl: item.imageUrl,
          originalPrice: item.originalPrice,
          salePrice: item.salePrice,
        },
        qty: item.qty,
      }),
    )
    navigate(ROUTES.CART)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">주문 상세</h1>
      </header>

      {/* 스크롤 영역 — CTA 높이만큼 하단 패딩 */}
      <div className={hasCta ? 'flex-1 overflow-y-auto pb-[84px]' : 'flex-1 overflow-y-auto pb-10'}>
        {isLoading && (
          <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
        )}

        {!isLoading && (isError || !order) && (
          <div className="px-8 py-16 text-center">
            <p className="text-[40px]">🧾</p>
            <p className="mt-3 text-[14px] text-muted-foreground">주문을 찾을 수 없어요.</p>
          </div>
        )}

        {order && (
          <div className="flex flex-col gap-3 pt-1 pb-2">
            {/* 스테퍼 */}
            <OrderStepper status={order.status} />

            {/* 픽업 코드 */}
            {showCode && (
              <div className="mx-5 rounded-[16px] border-2 border-primary/30 bg-primary/5 px-5 py-4 text-center">
                <p className="mb-1 text-[12px] font-semibold text-muted-foreground">
                  픽업 인증 코드
                </p>
                <p className="font-mono text-[32px] font-extrabold tracking-[0.3em] text-primary">
                  {order.pickupCode}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">매장에 보여주세요</p>
              </div>
            )}

            <div className="flex flex-col gap-3 px-5">
              {/* 매장 정보 */}
              <section className="flex items-center justify-between rounded-[14px] border border-border bg-card px-4 py-3.5">
                <div>
                  <p className="text-[13px] text-muted-foreground">매장</p>
                  <p className="mt-0.5 text-[15px] font-bold text-foreground">{order.storeName}</p>
                </div>
                {order.storePhone && (
                  <a
                    href={`tel:${order.storePhone}`}
                    className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-[18px] transition active:bg-primary/20"
                    aria-label="매장에 전화"
                  >
                    📞
                  </a>
                )}
              </section>

              {/* 주문 항목 */}
              <section className="rounded-[14px] border border-border bg-card p-4">
                <p className="mb-2.5 text-[13px] font-bold text-foreground">주문 항목</p>
                <ul className="flex flex-col gap-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-foreground">
                        {item.name} ×{item.qty}
                      </span>
                      <span className="font-semibold">{won(item.salePrice * item.qty)}</span>
                    </li>
                  ))}
                </ul>
                {/* 금액 요약 */}
                <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-2.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span>{won(order.amounts.normalTotal)}</span>
                  </div>
                  {order.amounts.discountTotal > 0 && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted-foreground">마감 할인</span>
                      <span className="font-semibold text-primary">
                        -{won(order.amounts.discountTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-[14px] font-extrabold">
                    <span>결제 금액</span>
                    <span className="text-primary">{won(order.amounts.payTotal)}</span>
                  </div>
                </div>
              </section>

              {/* 픽업 정보 */}
              <section className="rounded-[14px] border border-border bg-card p-4">
                <p className="mb-2.5 text-[13px] font-bold text-foreground">픽업 정보</p>
                <dl className="flex flex-col gap-2">
                  <Row label="주문 번호" value={`#${order.orderNo}`} />
                  <Row label="픽업 시간" value={pickupLabel} />
                  <Row label="결제 수단" value="토스페이" />
                  {order.memo && <Row label="요청사항" value={order.memo} />}
                </dl>
              </section>

              {/* 환불 — 픽업 완료 주문: 요청됨이면 상태 배너, 아니면 요청 진입(가능 기간 내) */}
              {order.status === 'COMPLETED' && order.refund && (
                <RefundStatusCard refund={order.refund} amount={order.amounts.payTotal} />
              )}
              {order.status === 'COMPLETED' && !order.refund && canRequestRefund(order) && (
                <section className="rounded-[14px] border border-border bg-card p-4">
                  <p className="text-[13px] font-bold text-foreground">
                    받으신 상품에 문제가 있나요?
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    픽업 완료 후 3일 이내에 환불을 요청할 수 있어요. 전액 환불·사장님 승인 후
                    처리돼요.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRefundOpen(true)}
                    className="mt-3 h-11 w-full rounded-xl bg-background text-[14px] font-bold text-foreground transition active:scale-[0.98]"
                  >
                    환불 요청
                  </button>
                </section>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA — 하단 고정 */}
      {order && hasCta && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-5 pb-[calc(env(safe-area-inset-bottom,16px)+8px)] pt-3">
          {order.status === 'PENDING' && (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-background text-[15px] font-bold text-destructive transition active:scale-[0.98]"
              >
                주문 취소
              </button>
              {order.storePhone && (
                <a
                  href={`tel:${order.storePhone}`}
                  className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98]"
                  aria-label="매장에 전화"
                >
                  매장에 전화
                </a>
              )}
            </div>
          )}

          {(order.status === 'PREPARING' || order.status === 'READY') && order.storePhone && (
            <a
              href={`tel:${order.storePhone}`}
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98]"
              aria-label="매장에 전화"
            >
              매장에 전화
            </a>
          )}

          {order.status === 'COMPLETED' && (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleReorder}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-background text-[15px] font-bold text-foreground transition active:scale-[0.98]"
              >
                재주문
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.REVIEW_WRITE(order.id))}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98]"
              >
                리뷰 작성
              </button>
            </div>
          )}
        </div>
      )}

      <CancelOrderSheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        isPending={cancel.isPending}
      />

      <RefundRequestSheet
        open={refundOpen}
        onOpenChange={setRefundOpen}
        onConfirm={handleRequestRefund}
        amount={order?.amounts.payTotal ?? 0}
        isPending={refund.isPending}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-[13.5px] font-semibold text-foreground">{value}</dd>
    </div>
  )
}

/** 환불 상태 배너 — 요청됨(처리중)/완료/거부(+거부 사유) 별 톤. (노션 「환불 요청」·「환불 승인/거부」) */
function RefundStatusCard({ refund, amount }: { refund: Refund; amount: number }) {
  const tone =
    refund.status === 'APPROVED'
      ? 'border-success/30 bg-success/5'
      : refund.status === 'REJECTED'
        ? 'border-destructive/30 bg-destructive/5'
        : 'border-primary/30 bg-primary/5'
  const labelTone =
    refund.status === 'APPROVED'
      ? 'text-success'
      : refund.status === 'REJECTED'
        ? 'text-destructive'
        : 'text-primary'

  return (
    <section className={cn('rounded-[14px] border p-4', tone)}>
      <div className="flex items-center justify-between">
        <p className={cn('text-[14px] font-bold', labelTone)}>
          {REFUND_STATUS_LABEL[refund.status]}
        </p>
        <span className="text-[13px] font-bold text-foreground">{won(amount)}</span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
        사유: {refund.reason}
      </p>
      {refund.status === 'REQUESTED' && (
        <p className="mt-1 text-[12px] text-muted-foreground">사장님 승인을 기다리고 있어요.</p>
      )}
      {refund.status === 'APPROVED' && (
        <p className="mt-1 text-[12px] text-muted-foreground">전액 환불이 완료됐어요.</p>
      )}
      {refund.status === 'REJECTED' && refund.rejectReason && (
        <p className="mt-2 rounded-lg bg-card px-3 py-2 text-[12.5px] leading-relaxed text-foreground">
          거부 사유: {refund.rejectReason}
        </p>
      )}
    </section>
  )
}
