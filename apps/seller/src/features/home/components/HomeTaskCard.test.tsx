import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeTaskCard } from './HomeTaskCard'
import { useOrders } from '@/features/order/hooks/useOrders'
import type { Order, OrderStatus } from '@/features/order/types'

vi.mock('@/features/order/hooks/useOrders')

const makeOrder = (status: OrderStatus): Order => ({
  id: `o-${status}-${Math.round(status.length)}`,
  storeId: 's1',
  orderNo: '1024',
  customerName: '빵순이',
  customerPhone: '010-0000-0000',
  placedAt: '2026-06-01T04:40:00.000Z',
  pickupTime: '14:30',
  pickupCode: '4827',
  status,
  items: [{ name: '버터 크루아상', quantity: 1, price: 3000 }],
  total: 3000,
  paymentMethod: '토스페이',
})

beforeEach(() => vi.clearAllMocks())

describe('HomeTaskCard', () => {
  it('상태별_주문_카운트를_표시', () => {
    // 신규(PENDING) 2 · 준비중(PREPARING) 1 · 준비완료(READY) 3 · 완료는 제외
    const orders = [
      makeOrder('PENDING'),
      makeOrder('PENDING'),
      makeOrder('PREPARING'),
      makeOrder('READY'),
      makeOrder('READY'),
      makeOrder('READY'),
      makeOrder('COMPLETED'),
    ]
    vi.mocked(useOrders).mockReturnValue({
      data: orders,
    } as unknown as ReturnType<typeof useOrders>)

    render(<HomeTaskCard />)

    expect(screen.getByText('2건')).toBeInTheDocument() // 신규 주문
    expect(screen.getByText('1건')).toBeInTheDocument() // 준비 완료 대기
    expect(screen.getByText('3건')).toBeInTheDocument() // 픽업 대기
  })

  it('세번째_버킷_라벨은_픽업_대기로_표기', () => {
    vi.mocked(useOrders).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useOrders>)

    render(<HomeTaskCard />)

    expect(screen.getByText('픽업 대기')).toBeInTheDocument()
    expect(screen.queryByText('픽업 임박')).toBeNull()
  })
})
