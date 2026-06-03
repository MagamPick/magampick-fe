import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CustomerOrderCard } from './CustomerOrderCard'
import type { Order } from '../types'

const base: Order = {
  id: 'o1',
  orderNo: '1001',
  storeId: 'st1',
  storeName: '테스트 매장',
  storePhone: '02-1234-5678',
  items: [
    {
      id: 'i1',
      kind: 'deal',
      name: '크루아상',
      imageUrl: null,
      originalPrice: 4000,
      salePrice: 3200,
      qty: 2,
    },
    {
      id: 'i2',
      kind: 'menu',
      name: '아메리카노',
      imageUrl: null,
      originalPrice: 3500,
      salePrice: 3500,
      qty: 1,
    },
  ],
  pickup: { type: 'slot', time: '18:30' },
  memo: '',
  amounts: { normalTotal: 11500, discountTotal: 1600, payTotal: 9900 },
  pickupCode: '4728',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: new Date().toISOString(),
}

describe('CustomerOrderCard', () => {
  it('매장명과 대표 상품명을 표시한다', () => {
    render(<CustomerOrderCard order={base} onClick={() => {}} />)
    expect(screen.getByText('테스트 매장')).toBeInTheDocument()
    expect(screen.getByText(/크루아상/)).toBeInTheDocument()
  })

  it('픽업 대기 상태(PENDING)면 픽업코드와 픽업시간을 표시한다', () => {
    render(<CustomerOrderCard order={base} onClick={() => {}} />)
    expect(screen.getByText('4728')).toBeInTheDocument()
    expect(screen.getByText(/18:30/)).toBeInTheDocument()
  })

  it('COMPLETED 상태면 리뷰 버튼을 표시한다', () => {
    render(<CustomerOrderCard order={{ ...base, status: 'COMPLETED' }} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /리뷰/ })).toBeInTheDocument()
  })

  it('CANCELLED 상태면 픽업코드를 표시하지 않는다', () => {
    render(<CustomerOrderCard order={{ ...base, status: 'CANCELLED' }} onClick={() => {}} />)
    expect(screen.queryByText('4728')).not.toBeInTheDocument()
  })

  it('완료 주문에 환불 정보가 있으면 환불 상태 칩을 표시한다', () => {
    render(
      <CustomerOrderCard
        order={{
          ...base,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          refund: { status: 'REQUESTED', reason: '사유', requestedAt: new Date().toISOString() },
        }}
        onClick={() => {}}
      />,
    )
    expect(screen.getByText('환불 처리 중')).toBeInTheDocument()
  })
})
