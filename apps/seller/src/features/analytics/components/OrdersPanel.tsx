import { StatRows } from './StatRows'
import { formatPercent, formatUnit, pickupRate } from '../lib/analyticsFormat'
import type { OrderMetrics } from '../types'

/** 주문 패널 — 총 주문·픽업 완료·취소·미수령(노쇼) 건수 + 픽업 완료율(강조). */
export function OrdersPanel({ orders }: { orders: OrderMetrics }) {
  return (
    <div className="px-5 pt-5">
      <StatRows
        rows={[
          { key: '총 주문', value: formatUnit(orders.total, '건') },
          { key: '픽업 완료', value: formatUnit(orders.pickedUp, '건') },
          { key: '취소', value: formatUnit(orders.canceled, '건') },
          { key: '미수령(노쇼)', value: formatUnit(orders.noShow, '건') },
          {
            key: '픽업 완료율',
            value: formatPercent(pickupRate(orders.pickedUp, orders.total)),
            accent: true,
          },
        ]}
      />
    </div>
  )
}
