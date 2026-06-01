import type { ReactNode } from 'react'
import { formatPickup, statusToSegment } from '../lib/orderStatus'
import type { Order, OrderItem } from '../types'
import { OrderStatusBadge } from './OrderStatusBadge'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 상품 요약 — 단일은 "이름 N개", 복수는 "첫 상품 외 N건" (프로토타입 order-card__items). */
function summarizeItems(items: OrderItem[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return `${items[0].name} ${items[0].quantity}개`
  return `${items[0].name} 외 ${items.length - 1}건`
}

export interface OrderCardProps {
  order: Order
  /** 카드 본문 탭 → 상세 이동(목록에서 주입). 없으면 비클릭 표시용 */
  onSelect?: () => void
  /** 인라인 액션 버튼 슬롯(목록 카드: 수락/거절·준비완료로 변경·수령완료 처리). 없으면 미표시 */
  actions?: ReactNode
}

/**
 * 사장 주문 카드 (프로토타입 owner-v3 order-card).
 * 본문(픽업·상태·상품요약·금액·고객) + 선택적 인라인 액션. 금액 라벨은 취소·환불 세그먼트면 "환불", 그 외 "결제".
 */
export function OrderCard({ order, onSelect, actions }: OrderCardProps) {
  const isCancel = statusToSegment(order.status) === 'cancel'

  return (
    <div className="rounded-[14px] border border-border bg-card p-[14px]">
      <button
        type="button"
        onClick={onSelect}
        className="block w-full text-left transition active:opacity-55"
      >
        <span className="mb-[9px] flex items-center gap-2">
          <span className="text-[14px] font-extrabold text-foreground">
            픽업 {formatPickup(order.pickupTime)}
          </span>
          <OrderStatusBadge status={order.status} className="ml-auto" />
        </span>
        <span className="block text-[14px] font-bold text-foreground">
          {summarizeItems(order.items)}
        </span>
        <span className="mt-[5px] flex gap-2.5 text-[12px] text-muted-foreground">
          <span>
            {isCancel ? '환불' : '결제'} <b className="font-bold text-foreground">{won(order.total)}</b>
          </span>
          <span>{isCancel ? order.paymentMethod : `${order.customerName}님`}</span>
        </span>
      </button>

      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  )
}
